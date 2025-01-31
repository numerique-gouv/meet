import { useTranslation } from 'react-i18next'
import { usePreviewTracks } from '@livekit/components-react'
import { css } from '@/styled-system/css'
import { Screen } from '@/layout/Screen'
import { useMemo, useEffect, useRef, useState } from 'react'
import { LocalVideoTrack, Track } from 'livekit-client'
import { H } from '@/primitives/H'
import { SelectToggleDevice } from '../livekit/components/controls/SelectToggleDevice'
import { Field } from '@/primitives/Field'
import { Form } from '@/primitives'
import { HStack, VStack } from '@/styled-system/jsx'
import { Button, Dialog } from '@/primitives'
import { LocalUserChoices } from '../routes/Room'
import { Heading } from 'react-aria-components'
import { RiImageCircleAiFill } from '@remixicon/react'
import {
  EffectsConfiguration,
  EffectsConfigurationProps,
} from '../livekit/components/effects/EffectsConfiguration'
import { usePersistentUserChoices } from '../livekit/hooks/usePersistentUserChoices'
import { BackgroundBlurFactory } from '../livekit/components/blur'
import { isMobileBrowser } from '@livekit/components-core'

const onError = (e: Error) => console.error('ERROR', e)

const Effects = ({
  videoTrack,
  onSubmit,
}: Pick<EffectsConfigurationProps, 'videoTrack' | 'onSubmit'>) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'join.effects' })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const openDialog = () => setIsDialogOpen(true)

  if (!BackgroundBlurFactory.isSupported() || isMobileBrowser()) {
    return
  }

  return (
    <>
      <Dialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role="dialog"
        type="flex"
        size="large"
      >
        <Heading
          slot="title"
          level={1}
          className={css({
            textStyle: 'h1',
            marginBottom: '1.5rem',
          })}
        >
          {t('title')}
        </Heading>
        <EffectsConfiguration videoTrack={videoTrack} onSubmit={onSubmit} />
      </Dialog>
      <div
        className={css({
          position: 'absolute',
          right: 0,
          bottom: '0',
          padding: '1rem',
          zIndex: '1',
        })}
      >
        <Button
          variant="whiteCircle"
          onPress={openDialog}
          tooltip={t('description')}
          aria-label={t('description')}
        >
          <RiImageCircleAiFill size={24} />
        </Button>
      </div>
      <div
        className={css({
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '20%',
          backgroundImage:
            'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(255,255,255,0) 100%)',
        })}
      />
    </>
  )
}

export const Join = ({
  onSubmit,
}: {
  onSubmit: (choices: LocalUserChoices) => void
}) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'join' })

  const {
    userChoices: initialUserChoices,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
    saveUsername,
    saveProcessorSerialized,
  } = usePersistentUserChoices({})

  const [audioDeviceId, setAudioDeviceId] = useState<string>(
    initialUserChoices.audioDeviceId
  )
  const [videoDeviceId, setVideoDeviceId] = useState<string>(
    initialUserChoices.videoDeviceId
  )
  const [username, setUsername] = useState<string>(initialUserChoices.username)
  const [processor, setProcessor] = useState(
    BackgroundBlurFactory.deserializeProcessor(
      initialUserChoices.processorSerialized
    )
  )

  useEffect(() => {
    saveAudioInputDeviceId(audioDeviceId)
  }, [audioDeviceId, saveAudioInputDeviceId])

  useEffect(() => {
    saveVideoInputDeviceId(videoDeviceId)
  }, [videoDeviceId, saveVideoInputDeviceId])

  useEffect(() => {
    saveUsername(username)
  }, [username, saveUsername])
  useEffect(() => {
    saveProcessorSerialized(processor?.serialize())
  }, [processor, saveProcessorSerialized])

  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)

  const tracks = usePreviewTracks(
    {
      audio: { deviceId: initialUserChoices.audioDeviceId },
      video: { deviceId: initialUserChoices.videoDeviceId },
    },
    onError
  )

  const videoTrack = useMemo(
    () =>
      tracks?.filter(
        (track) => track.kind === Track.Kind.Video
      )[0] as LocalVideoTrack,
    [tracks]
  )

  const audioTrack = useMemo(
    () =>
      tracks?.filter(
        (track) => track.kind === Track.Kind.Audio
      )[0] as LocalVideoTrack,
    [tracks]
  )

  const videoEl = useRef(null)

  useEffect(() => {
    const videoElement = videoEl.current as HTMLVideoElement | null

    const handleVideoLoaded = () => {
      if (videoElement) {
        videoElement.style.opacity = '1'
      }
    }

    if (videoElement && videoTrack && videoEnabled) {
      videoTrack.unmute()
      videoTrack.attach(videoElement)
      videoElement.addEventListener('loadedmetadata', handleVideoLoaded)
    }

    return () => {
      videoTrack?.detach()
      videoElement?.removeEventListener('loadedmetadata', handleVideoLoaded)
    }
  }, [videoTrack, videoEnabled])

  function handleSubmit() {
    onSubmit({
      audioEnabled,
      videoEnabled,
      audioDeviceId,
      videoDeviceId,
      username,
      processorSerialized: processor?.serialize(),
    })
  }

  // This hook is used to setup the persisted user choice processor on initialization.
  // So it's on purpose that processor is not included in the deps.
  // We just want to wait for the videoTrack to be loaded to apply the default processor.
  useEffect(() => {
    if (processor && videoTrack && !videoTrack.getProcessor()) {
      videoTrack.setProcessor(processor)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTrack])

  return (
    <Screen footer={false}>
      <div
        className={css({
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexGrow: 1,
          lg: {
            alignItems: 'center',
          },
        })}
      >
        <div
          className={css({
            display: 'flex',
            height: 'auto',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            padding: '0 2rem',
            flexDirection: 'column',
            minWidth: 0,
            width: '100%',
            lg: {
              flexDirection: 'row',
              width: 'auto',
              height: '570px',
            },
          })}
        >
          <div
            className={css({
              width: '100%',
              lg: {
                width: '740px',
              },
            })}
          >
            <div
              className={css({
                borderRadius: '1rem',
                overflow: 'hidden',
                position: 'relative',
                width: '100%',
                height: 'auto',
                aspectRatio: 16 / 9,
                '--tw-shadow':
                  '0 10px 15px -5px #00000010, 0 4px 5px -6px #00000010',
                '--tw-shadow-colored':
                  '0 10px 15px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color)',
                boxShadow:
                  'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)',
                backgroundColor: 'black',
              })}
            >
              {videoTrack && videoEnabled ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  ref={videoEl}
                  width="1280"
                  height="720"
                  className={css({
                    display: 'block',
                    width: '102%',
                    height: '102%',
                    objectFit: 'cover',
                    transform: 'rotateY(180deg)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                  })}
                  disablePictureInPicture
                  disableRemotePlayback
                />
              ) : (
                <div
                  className={css({
                    width: '100%',
                    height: '100%',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  })}
                >
                  <p
                    className={css({
                      fontSize: '24px',
                      fontWeight: '300',
                    })}
                  >
                    {!videoEnabled && t('cameraDisabled')}
                    {videoEnabled && !videoTrack && t('cameraStarting')}
                  </p>
                </div>
              )}
              <Effects videoTrack={videoTrack} onSubmit={setProcessor} />
            </div>
            <HStack justify="center" padding={1.5}>
              <SelectToggleDevice
                source={Track.Source.Microphone}
                initialState={audioEnabled}
                track={audioTrack}
                initialDeviceId={initialUserChoices.audioDeviceId}
                onChange={(enabled) => setAudioEnabled(enabled)}
                onDeviceError={(error) => console.error(error)}
                onActiveDeviceChange={(deviceId) =>
                  setAudioDeviceId(deviceId ?? '')
                }
                variant="tertiary"
              />
              <SelectToggleDevice
                source={Track.Source.Camera}
                initialState={videoEnabled}
                track={videoTrack}
                initialDeviceId={initialUserChoices.videoDeviceId}
                onChange={(enabled) => setVideoEnabled(enabled)}
                onDeviceError={(error) => console.error(error)}
                onActiveDeviceChange={(deviceId) =>
                  setVideoDeviceId(deviceId ?? '')
                }
                variant="tertiary"
              />
            </HStack>
          </div>
          <div
            className={css({
              width: '100%',
              flexShrink: 0,
              padding: '0',
              sm: {
                width: '448px',
                padding: '0 3rem 9rem 3rem',
              },
            })}
          >
            <Form
              onSubmit={handleSubmit}
              submitLabel={t('joinLabel')}
              submitButtonProps={{
                fullWidth: true,
              }}
            >
              <VStack marginBottom={1}>
                <H lvl={1} margin={false}>
                  {t('heading')}
                </H>
                <Field
                  type="text"
                  onChange={setUsername}
                  label={t('usernameLabel')}
                  aria-label={t('usernameLabel')}
                  defaultValue={initialUserChoices?.username}
                  validate={(value) => !value && t('errors.usernameEmpty')}
                  wrapperProps={{
                    noMargin: true,
                    fullWidth: true,
                  }}
                  labelProps={{
                    center: true,
                  }}
                  maxLength={50}
                />
              </VStack>
            </Form>
          </div>
        </div>
      </div>
    </Screen>
  )
}
