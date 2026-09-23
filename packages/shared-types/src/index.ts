export type EventRole = 'attendee' | 'organizer' | 'sponsor'

export interface BifrostEvent {
  id: string
  name: string
  venue: string
  startsAt: string
  endsAt: string
  active: boolean
}

export interface AttendeeProfile {
  id: string
  displayName: string
  role: string
  organization?: string
  interests: string[]
}

export interface Connection {
  id: string
  eventId: string
  sourceAttendeeId: string
  targetAttendeeId: string
  createdAt: string
  note?: string
}
