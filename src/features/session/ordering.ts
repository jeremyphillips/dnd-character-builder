import type { Session } from './session.types'
import { isUpcomingSession } from './dates'

export const sortSessionsByDate = (sessions: Session[]): Session[] =>
  [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

export const getNextSession = (sessions: Session[]): Session | undefined =>
  sortSessionsByDate(sessions).find((s) => isUpcomingSession(s.date))
