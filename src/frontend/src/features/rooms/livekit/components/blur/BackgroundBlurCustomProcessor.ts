import { ProcessorOptions, Track } from 'livekit-client'
import posthog from 'posthog-js'
import {
  FilesetResolver,
  ImageSegmenter,
  ImageSegmenterResult,
} from '@mediapipe/tasks-vision'
import {
  CLEAR_TIMEOUT,
  SET_TIMEOUT,
  TIMEOUT_TICK,
  timerWorkerScript,
} from './TimerWorker'
import { BackgroundBlurProcessorInterface, BackgroundOptions } from '.'

const PROCESSING_WIDTH = 256
const PROCESSING_HEIGHT = 144

const SEGMENTATION_MASK_CANVAS_ID = 'background-blur-local-segmentation'
const BLUR_CANVAS_ID = 'background-blur-local'

const DEFAULT_BLUR = '10'

/**
 * This implementation of video blurring is made to be run on CPU for browser that are
 * not compatible with track-processor-js.
 *
 * It also make possible to run blurring on browser that does not implement MediaStreamTrackGenerator and
 * MediaStreamTrackProcessor.
 */
export class BackgroundBlurCustomProcessor
  implements BackgroundBlurProcessorInterface
{
  options: BackgroundOptions
  name: string
  processedTrack?: MediaStreamTrack | undefined

  source?: MediaStreamTrack
  sourceSettings?: MediaTrackSettings
  videoElement?: HTMLVideoElement
  videoElementLoaded?: boolean

  // Canvas containg the video processing result, of which we extract as stream.
  outputCanvas?: HTMLCanvasElement
  outputCanvasCtx?: CanvasRenderingContext2D

  imageSegmenter?: ImageSegmenter
  imageSegmenterResult?: ImageSegmenterResult

  // Canvas used for resizing video source and projecting mask.
  segmentationMaskCanvas?: HTMLCanvasElement
  segmentationMaskCanvasCtx?: CanvasRenderingContext2D

  // Mask containg the inference result.
  segmentationMask?: ImageData

  // The resized image of the video source.
  sourceImageData?: ImageData

  timerWorker?: Worker

  constructor(opts: BackgroundOptions) {
    this.name = 'blur'
    this.options = opts
  }

  static get isSupported() {
    return navigator.userAgent.toLowerCase().includes('firefox')
  }

  async init(opts: ProcessorOptions<Track.Kind>) {
    if (!opts.element) {
      throw new Error('Element is required for processing')
    }

    this.source = opts.track as MediaStreamTrack
    this.sourceSettings = this.source!.getSettings()
    this.videoElement = opts.element as HTMLVideoElement

    this._createMainCanvas()
    this._createMaskCanvas()

    const stream = this.outputCanvas!.captureStream()
    const tracks = stream.getVideoTracks()
    if (tracks.length == 0) {
      throw new Error('No tracks found for processing')
    }
    this.processedTrack = tracks[0]

    this.segmentationMask = new ImageData(PROCESSING_WIDTH, PROCESSING_HEIGHT)
    await this.initSegmenter()
    this._initWorker()

    posthog.capture('firefox-blurring-init')
  }

  update(opts: BackgroundOptions): void {
    this.options = opts
  }

  _initWorker() {
    this.timerWorker = new Worker(timerWorkerScript, {
      name: 'Blurring',
    })
    this.timerWorker.onmessage = (data) => this.onTimerMessage(data)
    // When hiding camera then showing it again, the onloadeddata callback is not fired again.
    if (this.videoElementLoaded) {
      this.timerWorker!.postMessage({
        id: SET_TIMEOUT,
        timeMs: 1000 / 30,
      })
    } else {
      this.videoElement!.onloadeddata = () => {
        this.videoElementLoaded = true
        this.timerWorker!.postMessage({
          id: SET_TIMEOUT,
          timeMs: 1000 / 30,
        })
      }
    }
  }

  onTimerMessage(response: { data: { id: number } }) {
    if (response.data.id === TIMEOUT_TICK) {
      this.process()
    }
  }

  async initSegmenter() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    )
    this.imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite',
        delegate: 'CPU', // Use CPU for Firefox.
      },
      runningMode: 'VIDEO',
      outputCategoryMask: true,
      outputConfidenceMasks: false,
    })
  }

  /**
   * Resize the source video to the processing resolution.
   */
  async sizeSource() {
    this.segmentationMaskCanvasCtx?.drawImage(
      this.videoElement!,
      0,
      0,
      this.videoElement!.videoWidth,
      this.videoElement!.videoHeight,
      0,
      0,
      PROCESSING_WIDTH,
      PROCESSING_HEIGHT
    )

    this.sourceImageData = this.segmentationMaskCanvasCtx?.getImageData(
      0,
      0,
      PROCESSING_WIDTH,
      PROCESSING_WIDTH
    )
  }

  /**
   * Run the segmentation.
   */
  async segment() {
    const startTimeMs = performance.now()
    return new Promise<void>((resolve) => {
      this.imageSegmenter!.segmentForVideo(
        this.sourceImageData!,
        startTimeMs,
        (result: ImageSegmenterResult) => {
          this.imageSegmenterResult = result
          resolve()
        }
      )
    })
  }

  /**
   * TODO: future improvement with WebGL.
   */
  async blur() {
    const mask = this.imageSegmenterResult!.categoryMask!.getAsUint8Array()
    for (let i = 0; i < mask.length; ++i) {
      this.segmentationMask!.data[i * 4 + 3] = 255 - mask[i]
    }

    this.segmentationMaskCanvasCtx!.putImageData(this.segmentationMask!, 0, 0)

    this.outputCanvasCtx!.globalCompositeOperation = 'copy'
    this.outputCanvasCtx!.filter = 'blur(8px)'

    this.outputCanvasCtx!.drawImage(
      this.segmentationMaskCanvas!,
      0,
      0,
      PROCESSING_WIDTH,
      PROCESSING_HEIGHT,
      0,
      0,
      this.videoElement!.videoWidth,
      this.videoElement!.videoHeight
    )

    this.outputCanvasCtx!.globalCompositeOperation = 'source-in'
    this.outputCanvasCtx!.filter = 'none'
    this.outputCanvasCtx!.drawImage(this.videoElement!, 0, 0)

    this.outputCanvasCtx!.globalCompositeOperation = 'destination-over'
    this.outputCanvasCtx!.filter = `blur(${this.options.blurRadius ?? DEFAULT_BLUR}px)`
    this.outputCanvasCtx!.drawImage(this.videoElement!, 0, 0)
  }

  async process() {
    await this.sizeSource()
    await this.segment()
    await this.blur()
    this.timerWorker!.postMessage({
      id: SET_TIMEOUT,
      timeMs: 1000 / 30,
    })
  }

  _createMainCanvas() {
    this.outputCanvas = document.querySelector(
      'canvas#background-blur-local'
    ) as HTMLCanvasElement
    if (!this.outputCanvas) {
      this.outputCanvas = this._createCanvas(
        BLUR_CANVAS_ID,
        this.sourceSettings!.width!,
        this.sourceSettings!.height!
      )
    }
    this.outputCanvasCtx = this.outputCanvas.getContext('2d')!
  }

  _createMaskCanvas() {
    this.segmentationMaskCanvas = document.querySelector(
      `#${SEGMENTATION_MASK_CANVAS_ID}`
    ) as HTMLCanvasElement
    if (!this.segmentationMaskCanvas) {
      this.segmentationMaskCanvas = this._createCanvas(
        SEGMENTATION_MASK_CANVAS_ID,
        PROCESSING_WIDTH,
        PROCESSING_HEIGHT
      )
    }
    this.segmentationMaskCanvasCtx =
      this.segmentationMaskCanvas.getContext('2d')!
  }

  _createCanvas(id: string, width: number, height: number) {
    const element = document.createElement('canvas')
    element.setAttribute('id', id)
    element.setAttribute('width', '' + width)
    element.setAttribute('height', '' + height)
    return element
  }

  async restart(opts: ProcessorOptions<Track.Kind>) {
    await this.destroy()
    return this.init(opts)
  }

  async destroy() {
    this.timerWorker?.postMessage({
      id: CLEAR_TIMEOUT,
    })

    this.timerWorker?.terminate()
    this.imageSegmenter?.close()
  }

  clone() {
    return new BackgroundBlurCustomProcessor(this.options)
  }
}
