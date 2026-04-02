import type { CombatLogEvent } from '../state/types'
import type { CombatEvent, CombatIntentSuccess } from '../results'

/**
 * Concatenates all `CombatLogEvent` rows from every `log-appended` event in order.
 * Used for a single log/toast notification per successful intent (Phase 4D).
 */
export function flattenLogEntriesFromEvents(events: CombatEvent[]): CombatLogEvent[] {
  const out: CombatLogEvent[] = []
  for (const event of events) {
    if (event.kind === 'log-appended' && event.entries.length > 0) {
      out.push(...event.entries)
    }
  }
  return out
}

export function flattenLogEntriesFromIntentSuccess(result: CombatIntentSuccess): CombatLogEvent[] {
  return flattenLogEntriesFromEvents(result.events)
}
