import { ProcessorOptions, Track } from 'livekit-client'
import {
  BackgroundOptions,
  BackgroundProcessorInterface,
  ProcessorType,
} from '.'
import {
  BackgroundTransformer,
  ProcessorWrapper,
  VirtualBackground,
} from '@livekit/track-processors'

export class BackgroundVirtualTrackProcessorJsWrapper
  implements BackgroundProcessorInterface
{
  name = 'virtual'

  processor: ProcessorWrapper<BackgroundOptions>

  opts: BackgroundOptions

  constructor(opts: BackgroundOptions) {
    this.processor = VirtualBackground(opts.imagePath!)
    this.opts = opts
  }

  async init(opts: ProcessorOptions<Track.Kind>) {
    return this.processor.init(opts)
  }

  async restart(opts: ProcessorOptions<Track.Kind>) {
    return this.processor.restart(opts)
  }

  async destroy() {
    return this.processor.destroy()
  }

  update(opts: BackgroundOptions): void {
    this.processor.updateTransformerOptions(opts)
  }

  get processedTrack() {
    return this.processor.processedTrack
  }

  get options() {
    return (this.processor.transformer as BackgroundTransformer).options
  }

  clone() {
    return new BackgroundVirtualTrackProcessorJsWrapper(this.options)
  }

  serialize() {
    return {
      type: ProcessorType.VIRTUAL,
      options: this.options,
    }
  }
}
