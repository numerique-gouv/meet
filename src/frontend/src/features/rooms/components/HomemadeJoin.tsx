import { Screen } from '@/layout/Screen'
import {
  Button,
  Div,
  Field,
  Form,
  H,
  Menu,
  MenuList,
  ToggleButton,
  VerticallyOffCenter,
} from '@/primitives'
import { Center, HStack, VStack } from '@/styled-system/jsx'
import {
  RiArrowDropDownLine,
  RiMicLine,
  RiMicOffLine,
  RiVideoOffLine,
  RiVideoOnLine,
  RiVolumeUpLine,
} from '@remixicon/react'
import {
  useMaybeRoomContext,
  usePreviewTracks,
} from '@livekit/components-react'
import { Track, LocalVideoTrack, LocalAudioTrack } from 'livekit-client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import {
  usePersistedMediaDeviceSelect,
  useAudioOutputs,
} from '@/features/devices'
import { settingsStore, type SettingsState } from '@/features/settings'
import { css } from '@/styled-system/css'

export const HomemadeJoin = ({
  onSubmit,
}: {
  onSubmit: (choices: {
    devices: SettingsState['devices']
    username: SettingsState['username']
  }) => void
}) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'join' })

  const settingsSnap = useSnapshot(settingsStore)
  const [initialUserChoices] = useState({ ...settingsSnap.devices })

  const tracks = usePreviewTracks({
    audio: settingsSnap.devices.enableMic
      ? { deviceId: initialUserChoices.micDeviceId }
      : false,
    video: settingsSnap.devices.enableCamera
      ? { deviceId: initialUserChoices.cameraDeviceId }
      : false,
  })

  const videoEl = useRef(null)
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
      )[0] as LocalAudioTrack,
    [tracks]
  )

  useEffect(() => {
    if (videoEl.current && videoTrack) {
      videoTrack.unmute()
      videoTrack.attach(videoEl.current)
    }

    return () => {
      videoTrack?.detach()
    }
  }, [videoTrack])
  const room = useMaybeRoomContext()

  const {
    devices: micDevices,
    activeDeviceId: activeMicDeviceId,
    setActiveMediaDevice: setActiveMicDevice,
  } = usePersistedMediaDeviceSelect({
    kind: 'audioinput',
    room,
    track: audioTrack,
    requestPermissions: true,
  })
  const {
    devices: cameraDevices,
    activeDeviceId: activeCameraDeviceId,
    setActiveMediaDevice: setActiveCameraDevice,
  } = usePersistedMediaDeviceSelect({
    kind: 'videoinput',
    room,
    track: videoTrack,
    requestPermissions: true,
  })
  const speakerDevices = useAudioOutputs()

  useEffect(() => {
    if (settingsStore.devices.micDeviceId) {
      setActiveMicDevice(settingsStore.devices.micDeviceId)
    }
    if (settingsStore.devices.cameraDeviceId) {
      setActiveCameraDevice(settingsStore.devices.cameraDeviceId)
    }
  }, [setActiveCameraDevice, setActiveMicDevice])

  return (
    <Screen>
      <VerticallyOffCenter>
        <Div
          className={css({
            margin: 'auto',
            flexWrap: 'wrap',
            width: 'fit-content',
            maxWidth: 'full',
            display: 'flex',
            gap: 2,
            paddingX: 1,
            flexDirection: 'column',
            alignItems: 'center',
            lg: {
              alignItems: 'stretch',
              flexDirection: 'row',
            },
          })}
        >
          <VStack
            className={css({
              width: 'full',
              maxWidth: '38rem',
              margin: '0 auto',
              alignItems: 'center',
              flexShrink: '1',
            })}
          >
            <Center
              className={css({
                width: '38rem',
                maxWidth: 'full',
                height: 'auto',
                aspectRatio: '16 / 9',
                background: 'gray.900',
                color: 'white',
                borderRadius: 16,
                overflow: 'hidden',
              })}
            >
              {videoTrack && settingsSnap.devices.enableCamera ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  ref={videoEl}
                  width="608"
                  height="342"
                  className={css({
                    width: 'full',
                    height: 'auto',
                  })}
                />
              ) : (
                settingsSnap.devices.enableCamera === false && (
                  <p>{t('cameraPlaceholder')}</p>
                )
              )}
            </Center>
            <HStack gap={1} justify="center" flexWrap={'wrap'}>
              {/* audio output dropdown */}
              <Menu>
                <Button
                  tooltip={t('chooseSpeaker')}
                  aria-label={t('chooseSpeaker')}
                >
                  <RiVolumeUpLine />
                  <RiArrowDropDownLine />
                </Button>
                <MenuList
                  items={speakerDevices.map((d) => ({
                    value: d.deviceId,
                    label: d.label,
                  }))}
                  selectedItem={settingsSnap.devices.speakerDeviceId}
                  onAction={(value) => {
                    settingsStore.devices.speakerDeviceId = value as string
                  }}
                />
              </Menu>

              {/* audio input toggle + dropdown */}
              <HStack gap={0}>
                <ToggleButton
                  isSelected={settingsSnap.devices.enableMic}
                  variant={
                    settingsSnap.devices.enableMic ? undefined : 'danger'
                  }
                  toggledStyles={false}
                  onChange={(enabled) =>
                    (settingsStore.devices.enableMic = enabled)
                  }
                  aria-label={
                    settingsSnap.devices.enableMic
                      ? `${t('micIsOn')} ${t('toggleOff')}`
                      : `${t('micIsOff')} ${t('toggleOn')}`
                  }
                  tooltip={
                    settingsSnap.devices.enableMic ? (
                      <>
                        {t('micIsOn')}
                        <br />
                        {t('toggleOff')}
                      </>
                    ) : (
                      <>
                        {t('micIsOff')}
                        <br />
                        {t('toggleOn')}
                      </>
                    )
                  }
                  groupPosition="left"
                >
                  {settingsSnap.devices.enableMic ? (
                    <RiMicLine />
                  ) : (
                    <RiMicOffLine />
                  )}
                </ToggleButton>
                <Menu>
                  <Button
                    tooltip={t('chooseMic')}
                    aria-label={t('chooseMic')}
                    groupPosition="right"
                    square
                  >
                    <RiArrowDropDownLine />
                  </Button>
                  <MenuList
                    items={micDevices.map((d) => ({
                      value: d.deviceId,
                      label: d.label,
                    }))}
                    selectedItem={activeMicDeviceId}
                    onAction={(value) => {
                      setActiveMicDevice(value as string)
                    }}
                  />
                </Menu>
              </HStack>

              {/* video toggle + dropdown */}
              <HStack gap={0}>
                <ToggleButton
                  isSelected={settingsSnap.devices.enableCamera}
                  variant={
                    settingsSnap.devices.enableCamera ? undefined : 'danger'
                  }
                  toggledStyles={false}
                  onChange={(enabled) =>
                    (settingsStore.devices.enableCamera = enabled)
                  }
                  aria-label={
                    settingsSnap.devices.enableMic
                      ? `${t('cameraIsOn')} ${t('toggleOff')}`
                      : `${t('cameraIsOff')} ${t('toggleOn')}`
                  }
                  tooltip={
                    settingsSnap.devices.enableMic ? (
                      <>
                        {t('cameraIsOn')}
                        <br />
                        {t('toggleOff')}
                      </>
                    ) : (
                      <>
                        {t('cameraIsOff')}
                        <br />
                        {t('toggleOn')}
                      </>
                    )
                  }
                  groupPosition="left"
                >
                  {settingsSnap.devices.enableCamera ? (
                    <RiVideoOnLine />
                  ) : (
                    <RiVideoOffLine />
                  )}
                </ToggleButton>
                <Menu>
                  <Button
                    tooltip={t('chooseCamera')}
                    aria-label={t('chooseCamera')}
                    groupPosition="right"
                    square
                  >
                    <RiArrowDropDownLine />
                  </Button>
                  <MenuList
                    items={cameraDevices.map((d) => ({
                      value: d.deviceId,
                      label: d.label,
                    }))}
                    selectedItem={activeCameraDeviceId}
                    onAction={(value) => {
                      setActiveCameraDevice(value as string)
                    }}
                  />
                </Menu>
              </HStack>
            </HStack>
          </VStack>
          <Div width="24rem" maxWidth="full" flexShrink="1">
            <VerticallyOffCenter>
              <Center>
                <H lvl={1}>{t('heading')}</H>
              </Center>
              <Form
                onSubmit={(data) => {
                  settingsStore.username = (data.username as string).trim()
                  onSubmit({
                    devices: { ...settingsStore.devices },
                    username: settingsStore.username,
                  })
                }}
                submitLabel={t('joinMeeting')}
                withSubmitButton={false}
              >
                <Field
                  type="text"
                  name="username"
                  defaultValue={settingsSnap.username}
                  label={t('usernameLabel')}
                  description={t('usernameHint')}
                  isRequired
                />
                <Center>
                  <Button type="submit" variant="primary">
                    {t('joinMeeting')}
                  </Button>
                </Center>
              </Form>
            </VerticallyOffCenter>
          </Div>
        </Div>
      </VerticallyOffCenter>
    </Screen>
  )
}
