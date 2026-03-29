import type { CombatantInstance } from '@/features/mechanics/domain/encounter/state/types'

import type { EncounterViewerPerceptionCapabilities } from './perception.types'

/**
 * Derives viewer perception capabilities from combatant runtime stats (e.g. monster senses → darkvision range).
 */
export function getEncounterViewerPerceptionCapabilitiesFromCombatant(
  combatant: CombatantInstance,
): EncounterViewerPerceptionCapabilities | undefined {
  const r = combatant.stats.skillRuntime?.darkvisionRangeFt
  if (r == null || r <= 0) return undefined
  return { darkvisionRangeFt: r }
}
