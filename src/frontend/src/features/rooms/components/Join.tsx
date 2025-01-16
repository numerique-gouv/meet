import { useTranslation } from 'react-i18next'
import {
  ParticipantPlaceholder,
  usePersistentUserChoices,
  usePreviewTracks,
  type LocalUserChoices,
} from '@livekit/components-react'
import { css } from '@/styled-system/css'
import { log } from '@livekit/components-core'
import { defaultUserChoices } from '@livekit/components-core'
import { Screen } from '@/layout/Screen'
import { useUser } from '@/features/auth'
import React from 'react'
import {
  facingModeFromLocalTrack,
  LocalVideoTrack,
  Track,
} from 'livekit-client'
import { H } from '@/primitives/H'
import { SelectToggleDevice } from '../livekit/components/controls/SelectToggleDevice'
import { Field } from '@/primitives/Field'
import { Button } from '@/primitives'

const onError = (e: Error) => console.error('ERROR', e)

export const Join = ({
  onSubmit,
}: {
  onSubmit: (choices: LocalUserChoices) => void
}) => {
  const { t } = useTranslation('rooms')
  const { user } = useUser()
  const defaults: Partial<LocalUserChoices> = { username: user?.full_name }
  const persistUserChoices = true
  const joinLabel = t('join.joinLabel')
  const userLabel = t('join.usernameLabel')
  const debug = false

  const [userChoices, setUserChoices] = React.useState(defaultUserChoices)

  // TODO: Remove and pipe `defaults` object directly into `usePersistentUserChoices` once we fully switch from type `LocalUserChoices` to `UserChoices`.
  const partialDefaults: Partial<LocalUserChoices> = {
    ...(defaults.audioDeviceId !== undefined && {
      audioDeviceId: defaults.audioDeviceId,
    }),
    ...(defaults.videoDeviceId !== undefined && {
      videoDeviceId: defaults.videoDeviceId,
    }),
    ...(defaults.audioEnabled !== undefined && {
      audioEnabled: defaults.audioEnabled,
    }),
    ...(defaults.videoEnabled !== undefined && {
      videoEnabled: defaults.videoEnabled,
    }),
    ...(defaults.username !== undefined && { username: defaults.username }),
  }

  const {
    userChoices: initialUserChoices,
    saveAudioInputDeviceId,
    saveAudioInputEnabled,
    saveVideoInputDeviceId,
    saveVideoInputEnabled,
    saveUsername,
  } = usePersistentUserChoices({
    defaults: partialDefaults,
    preventSave: !persistUserChoices,
    preventLoad: !persistUserChoices,
  })

  // Initialize device settings
  const [audioEnabled, setAudioEnabled] = React.useState<boolean>(
    initialUserChoices.audioEnabled
  )
  const [videoEnabled, setVideoEnabled] = React.useState<boolean>(
    initialUserChoices.videoEnabled
  )
  const [audioDeviceId, setAudioDeviceId] = React.useState<string>(
    initialUserChoices.audioDeviceId
  )
  const [videoDeviceId, setVideoDeviceId] = React.useState<string>(
    initialUserChoices.videoDeviceId
  )
  const [username, setUsername] = React.useState(initialUserChoices.username)

  // Save user choices to persistent storage.
  React.useEffect(() => {
    saveAudioInputEnabled(audioEnabled)
  }, [audioEnabled, saveAudioInputEnabled])
  React.useEffect(() => {
    saveVideoInputEnabled(videoEnabled)
  }, [videoEnabled, saveVideoInputEnabled])
  React.useEffect(() => {
    saveAudioInputDeviceId(audioDeviceId)
  }, [audioDeviceId, saveAudioInputDeviceId])
  React.useEffect(() => {
    saveVideoInputDeviceId(videoDeviceId)
  }, [videoDeviceId, saveVideoInputDeviceId])
  React.useEffect(() => {
    saveUsername(username)
  }, [username, saveUsername])

  const tracks = usePreviewTracks(
    {
      audio: audioEnabled
        ? { deviceId: initialUserChoices.audioDeviceId }
        : false,
      video: videoEnabled
        ? { deviceId: initialUserChoices.videoDeviceId }
        : false,
    },
    onError
  )

  const videoEl = React.useRef(null)

  const videoTrack = React.useMemo(
    () =>
      tracks?.filter(
        (track) => track.kind === Track.Kind.Video
      )[0] as LocalVideoTrack,
    [tracks]
  )

  const facingMode = React.useMemo(() => {
    if (videoTrack) {
      const { facingMode } = facingModeFromLocalTrack(videoTrack)
      return facingMode
    } else {
      return 'undefined'
    }
  }, [videoTrack])

  React.useEffect(() => {
    if (videoEl.current && videoTrack) {
      videoTrack.unmute()
      videoTrack.attach(videoEl.current)
    }

    return () => {
      videoTrack?.detach()
    }
  }, [videoTrack])

  const [isValid, setIsValid] = React.useState<boolean>()

  const handleValidation = React.useCallback((values: LocalUserChoices) => {
    return values.username !== ''
  }, [])

  React.useEffect(() => {
    const newUserChoices = {
      username,
      videoEnabled,
      videoDeviceId,
      audioEnabled,
      audioDeviceId,
    }
    setUserChoices(newUserChoices)
    setIsValid(handleValidation(newUserChoices))
  }, [
    username,
    videoEnabled,
    handleValidation,
    audioEnabled,
    audioDeviceId,
    videoDeviceId,
  ])

  function handleSubmit() {
    if (handleValidation(userChoices)) {
      if (typeof onSubmit === 'function') {
        onSubmit(userChoices)
      }
    } else {
      log.warn('Validation failed with: ', userChoices)
    }
  }

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
                  '0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a',
                '--tw-shadow-colored':
                  '0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color)',
                boxShadow:
                  'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)',
              })}
            >
              {videoTrack && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  ref={videoEl}
                  width="1280"
                  height="720"
                  data-lk-facing-mode={facingMode}
                  className={css({
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  })}
                />
              )}
              {(!videoTrack || !videoEnabled) && (
                <div
                  id="container"
                  className={css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#000',
                    display: 'grid',
                    placeItems: 'center',
                  })}
                >
                  <ParticipantPlaceholder
                    className={css({
                      maxWidth: '100%',
                      height: '70%',
                    })}
                  />
                </div>
              )}
              <div className="lk-button-group-container"></div>
            </div>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '1.5rem',
                gap: '1rem',
              })}
            >
              <SelectToggleDevice
                source={Track.Source.Microphone}
                onChange={(enabled) => setAudioEnabled(enabled)}
                initialState={audioEnabled}
                onDeviceError={(error) => console.error(error)}
                onActiveDeviceChange={(deviceId) =>
                  setAudioDeviceId(deviceId ?? '')
                }
                variant="tertiary"
              />
              <SelectToggleDevice
                source={Track.Source.Camera}
                initialState={videoEnabled}
                onChange={(enabled) => {
                  setVideoEnabled(enabled)
                }}
                onDeviceError={(error) => console.error(error)}
                onActiveDeviceChange={(deviceId) =>
                  setVideoDeviceId(deviceId ?? '')
                }
                variant="tertiary"
              />
            </div>
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
            <form
              className={css({
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
              })}
            >
              <H lvl={1} className={css({ marginBottom: 0 })}>
                {t('join.heading')}
              </H>
              <Field
                type="text"
                label={userLabel}
                defaultValue={username}
                onChange={(value) => setUsername(value)}
                validate={(value) => {
                  return !value ? (
                    <p>{'Votre Nom ne peut pas être vide'}</p>
                  ) : null
                }}
                className={css({
                  width: '100%',
                })}
                wrapperProps={{
                  noMargin: true,
                  fullWidth: true,
                }}
                labelProps={{
                  center: true,
                }}
              />
              <Button
                variant={'primary'}
                onPress={handleSubmit}
                isDisabled={!isValid}
                fullWidth
              >
                {joinLabel}
              </Button>
            </form>
          </div>

          {debug && (
            <>
              <strong>User Choices:</strong>
              <ul
                className="lk-list"
                style={{ overflow: 'hidden', maxWidth: '15rem' }}
              >
                <li>Username: {`${userChoices.username}`}</li>
                <li>Video Enabled: {`${userChoices.videoEnabled}`}</li>
                <li>Audio Enabled: {`${userChoices.audioEnabled}`}</li>
                <li>Video Device: {`${userChoices.videoDeviceId}`}</li>
                <li>Audio Device: {`${userChoices.audioDeviceId}`}</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </Screen>
  )
}
