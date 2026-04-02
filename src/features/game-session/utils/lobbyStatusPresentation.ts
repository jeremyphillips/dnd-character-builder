import type { GameSession } from '../domain/game-session.types'
import { formatSessionDateTime } from '@/features/session/dates'

export type LobbyStatusBanner = {
  severity: 'info' | 'success' | 'warning' | 'error'
  title: string
  body?: string
}

/** Display-only relative phrasing; does not affect session status. */
export function formatRelativeToScheduled(iso: string, nowMs: number = Date.now()): string {
  const then = new Date(iso).getTime()
  const diffMs = then - nowMs
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const minutes = Math.round(diffMs / 60000)
  if (Math.abs(minutes) < 120) {
    return rtf.format(minutes, 'minute')
  }
  const hours = Math.round(diffMs / 3600000)
  if (Math.abs(hours) < 48) {
    return rtf.format(hours, 'hour')
  }
  const days = Math.round(diffMs / 86400000)
  return rtf.format(days, 'day')
}

/**
 * Authoritative copy for the lobby banner from `session.status`.
 * `scheduledFor` is only used for planning/messaging, never to infer status.
 */
export function getLobbyStatusBanner(
  session: GameSession,
  nowMs: number = Date.now(),
): LobbyStatusBanner {
  const { status, scheduledFor } = session
  switch (status) {
    case 'draft':
      return {
        severity: 'info',
        title: 'Session is being prepared',
        body:
          'This session is still a draft. Add a planned start time if you like, then schedule or open the lobby when you are ready.',
      }
    case 'scheduled': {
      let body =
        'The lobby stays closed until you choose Open now in session setup. Planned time does not open the session automatically.'
      if (scheduledFor) {
        const planned = formatSessionDateTime(scheduledFor)
        const then = new Date(scheduledFor).getTime()
        const isOverdue = then < nowMs
        if (isOverdue) {
          body = `Planned start was ${planned}. That time has passed — the session stays scheduled until you open the lobby from setup.`
        } else {
          const rel = formatRelativeToScheduled(scheduledFor, nowMs)
          body = `Planned start: ${planned} (${rel}). The lobby stays closed until you use Open now in setup.`
        }
      }
      return {
        severity: 'info',
        title: 'Session is scheduled — not open yet',
        body,
      }
    }
    case 'lobby':
      return {
        severity: 'success',
        title: 'Lobby is open',
        body: scheduledFor
          ? `Planned time: ${formatSessionDateTime(scheduledFor)}. Opening the lobby was a manual action; encounters start when you choose.`
          : 'Players can gather here. Encounters start when you choose.',
      }
    case 'active':
      return {
        severity: 'success',
        title: 'Session is live',
        body: scheduledFor ? `Planned time was ${formatSessionDateTime(scheduledFor)}.` : undefined,
      }
    case 'completed':
      return {
        severity: 'info',
        title: 'Session has ended',
        body: scheduledFor ? `Had been planned for ${formatSessionDateTime(scheduledFor)}.` : undefined,
      }
    case 'cancelled':
      return {
        severity: 'warning',
        title: 'Session cancelled',
      }
  }
}
