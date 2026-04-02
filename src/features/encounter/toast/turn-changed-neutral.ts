import type { CombatLogEvent } from '@/features/mechanics/domain/combat'
import type { EncounterState } from '@/features/mechanics/domain/combat/state/types'
import { getCombatantDisplayLabel } from '@/features/mechanics/domain/combat/state'

import type { TurnChangedNeutralPayload } from './encounter-toast-types'

const TURN_ROUND_MARKER_TYPES = new Set<CombatLogEvent['type']>([
  'turn-ended',
  'turn-started',
  'round-started',
  'encounter-started',
])

/** Strip turn/round markers so `action_resolved` does not misfire on turn-only batches. */
export function filterActionEventsForEncounterToast(events: CombatLogEvent[]): CombatLogEvent[] {
  return events.filter((e) => !TURN_ROUND_MARKER_TYPES.has(e.type))
}

/**
 * Parse a turn transition from a new combat-log suffix (first `turn-ended` → last `turn-started`).
 * Returns null when no valid transition or when active did not change.
 */
export function parseTurnChangedFromNewLogSlice(
  events: CombatLogEvent[],
  stateAfter: EncounterState,
): TurnChangedNeutralPayload | null {
  if (events.length === 0) return null

  const firstEnded = events.find((e) => e.type === 'turn-ended')
  const turnStarted = events.filter((e) => e.type === 'turn-started')
  const lastStarted = turnStarted[turnStarted.length - 1]

  if (!firstEnded?.actorId || !lastStarted?.actorId) return null

  const endedActiveId = firstEnded.actorId
  const nextActiveId = lastStarted.actorId
  if (endedActiveId === nextActiveId) return null

  const roster = Object.values(stateAfter.combatantsById)
  const nextCombatant = stateAfter.combatantsById[nextActiveId]
  if (!nextCombatant) return null

  const nextDisplayName = getCombatantDisplayLabel(nextCombatant, roster)
  const ids = [...new Set(events.map((e) => e.id))].sort()
  const dedupeKey = `turn-r${lastStarted.round}-t${lastStarted.turn}-next-${nextActiveId}-${ids.join(':')}`

  return {
    endedActiveId,
    nextActiveId,
    round: lastStarted.round,
    turn: lastStarted.turn,
    dedupeKey,
    nextDisplayName,
  }
}
