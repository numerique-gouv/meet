import { ProcessorWrapper } from '@livekit/track-processors'
import { Track, TrackProcessor } from 'livekit-client'
import { BackgroundBlurTrackProcessorJsWrapper } from './BackgroundBlurTrackProcessorJsWrapper'
import { BackgroundBlurCustomProcessor } from './BackgroundBlurCustomProcessor'

export type BackgroundOptions = {
  blurRadius?: number
}

export interface BackgroundBlurProcessorInterface
  extends TrackProcessor<Track.Kind> {
  update(opts: BackgroundOptions): void
  options: BackgroundOptions
  clone(): BackgroundBlurProcessorInterface
}

export class BackgroundBlurFactory {
  static isSupported() {
    return (
      ProcessorWrapper.isSupported || BackgroundBlurCustomProcessor.isSupported
    )
  }

  static getProcessor(opts: BackgroundOptions) {
    if (ProcessorWrapper.isSupported) {
      return new BackgroundBlurTrackProcessorJsWrapper(opts)
    }
    if (BackgroundBlurCustomProcessor.isSupported) {
      return new BackgroundBlurCustomProcessor(opts)
    }
    return null
  }
}
