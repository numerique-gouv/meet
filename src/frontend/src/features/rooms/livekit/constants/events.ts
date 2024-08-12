import { RoomEvent } from 'livekit-client'

// Issue: 'allRemoteParticipantRoomEvents' is not exposed or importable. One event is missing
// to trigger the real-time update of participants when they change their name.
// This code is duplicated from LiveKit.
export const allRemoteParticipantRoomEvents = [
  RoomEvent.ConnectionStateChanged,
  RoomEvent.RoomMetadataChanged,

  RoomEvent.ActiveSpeakersChanged,
  RoomEvent.ConnectionQualityChanged,

  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.ParticipantPermissionsChanged,
  RoomEvent.ParticipantMetadataChanged,
  RoomEvent.ParticipantNameChanged, // This element is missing in LiveKit and causes problems

  RoomEvent.TrackMuted,
  RoomEvent.TrackUnmuted,
  RoomEvent.TrackPublished,
  RoomEvent.TrackUnpublished,
  RoomEvent.TrackStreamStateChanged,
  RoomEvent.TrackSubscriptionFailed,
  RoomEvent.TrackSubscriptionPermissionChanged,
  RoomEvent.TrackSubscriptionStatusChanged,
]

export const allParticipantRoomEvents = [
  ...allRemoteParticipantRoomEvents,
  RoomEvent.LocalTrackPublished,
  RoomEvent.LocalTrackUnpublished,
]
