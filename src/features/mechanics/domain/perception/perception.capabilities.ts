import type { CombatantInstance } from '@/features/mechanics/domain/encounter/state/types'

import type { EncounterViewerPerceptionCapabilities } from './perception.types'

/**
 * Max darkvision range (ft) from authored combatant senses (`senses.special`), else from
 * `stats.skillRuntime.darkvisionRangeFt` when present (legacy/monster builder mirror).
 */
export function getCombatantDarkvisionRangeFt(combatant: CombatantInstance): number | undefined {
  const special = combatant.senses?.special
  if (special?.length) {
    let max = 0
    for (const s of special) {
      if (s.type === 'darkvision' && typeof s.range === 'number' && s.range > max) max = s.range
    }
    if (max > 0) return max
  }
  const fromSkill = combatant.stats.skillRuntime?.darkvisionRangeFt
  if (fromSkill != null && fromSkill > 0) return fromSkill
  return undefined
}

/**
 * Max blindsight range (ft) from `senses.special` entries with `type: 'blindsight'`.
 */
export function getCombatantBlindsightRangeFt(combatant: CombatantInstance): number | undefined {
  const special = combatant.senses?.special
  if (!special?.length) return undefined
  let max = 0
  for (const s of special) {
    if (s.type === 'blindsight' && typeof s.range === 'number' && s.range > max) max = s.range
  }
  return max > 0 ? max : undefined
}

export type CombatantVisionSenseRanges = {
  darkvisionRangeFt?: number
  blindsightRangeFt?: number
}

/**
 * Darkvision and blindsight ranges from combatant senses (and darkvision skillRuntime fallback).
 */
export function getCombatantVisionSenseRanges(combatant: CombatantInstance): CombatantVisionSenseRanges {
  const darkvisionRangeFt = getCombatantDarkvisionRangeFt(combatant)
  const blindsightRangeFt = getCombatantBlindsightRangeFt(combatant)
  return {
    ...(darkvisionRangeFt != null && darkvisionRangeFt > 0 ? { darkvisionRangeFt } : {}),
    ...(blindsightRangeFt != null && blindsightRangeFt > 0 ? { blindsightRangeFt } : {}),
  }
}

/**
 * Derives viewer perception capabilities from combatant runtime data (senses + skillRuntime fallback).
 */
export function getEncounterViewerPerceptionCapabilitiesFromCombatant(
  combatant: CombatantInstance,
): EncounterViewerPerceptionCapabilities | undefined {
  const ranges = getCombatantVisionSenseRanges(combatant)
  if (Object.keys(ranges).length === 0) return undefined
  return ranges
}
