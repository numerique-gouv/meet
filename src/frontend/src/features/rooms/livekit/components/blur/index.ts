import { ProcessorWrapper } from '@livekit/track-processors'
import { Track, TrackProcessor } from 'livekit-client'
import { BackgroundBlurTrackProcessorJsWrapper } from './BackgroundBlurTrackProcessorJsWrapper'
import { BackgroundBlurCustomProcessor } from './BackgroundBlurCustomProcessor'

export type BackgroundOptions = {
  blurRadius?: number
}

export interface ProcessorSerialized {
  type: ProcessorType
  options: BackgroundOptions
}

export interface BackgroundBlurProcessorInterface
  extends TrackProcessor<Track.Kind> {
  update(opts: BackgroundOptions): void
  options: BackgroundOptions
  clone(): BackgroundBlurProcessorInterface
  serialize(): ProcessorSerialized
}

export enum ProcessorType {
  BLUR = 'blur',
}

export class BackgroundBlurFactory {
  static isSupported() {
    return (
      ProcessorWrapper.isSupported || BackgroundBlurCustomProcessor.isSupported
    )
  }

  static getProcessor(
    opts: BackgroundOptions
  ): BackgroundBlurProcessorInterface | undefined {
    if (ProcessorWrapper.isSupported) {
      return new BackgroundBlurTrackProcessorJsWrapper(opts)
    }
    if (BackgroundBlurCustomProcessor.isSupported) {
      return new BackgroundBlurCustomProcessor(opts)
    }
    return undefined
  }

  static deserializeProcessor(data?: ProcessorSerialized) {
    if (data?.type === ProcessorType.BLUR) {
      return BackgroundBlurFactory.getProcessor(data?.options)
    }
    return undefined
  }
}
