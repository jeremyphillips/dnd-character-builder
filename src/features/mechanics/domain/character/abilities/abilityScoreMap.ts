import { ABILITIES } from './abilities'
import type {
  AbilityId,
  AbilityScoreMap,
  AbilityScoreMapResolved,
  AbilityScoreValue,
} from './abilities.types'
import { abilityRegistry } from './abilities.utils'

const DEFAULT_ABILITY_SCORE = 10 as const

/**
 * Read a single ability score from a map that may use short ids (`dex`) and/or full keys (`dexterity`).
 * Prefer `abilityId` when both are present (caller's map should not duplicate; if it does, id wins).
 */
export function getAbilityScoreValue(
  map: AbilityScoreMap | undefined | null,
  abilityId: AbilityId,
  defaultScore: AbilityScoreValue | typeof DEFAULT_ABILITY_SCORE = DEFAULT_ABILITY_SCORE,
): number {
  if (map == null) return defaultScore

  const fromId = map[abilityId as keyof AbilityScoreMap]
  if (typeof fromId === 'number') return fromId

  const key = abilityRegistry.byId[abilityId].key
  const fromKey = map[key as keyof AbilityScoreMap]
  if (typeof fromKey === 'number') return fromKey

  return defaultScore
}

/**
 * Normalize a mixed id/key map into a full key-shaped record (defaults 10 for missing abilities).
 */
export function resolveAbilityScoreMap(
  map: AbilityScoreMap | undefined | null,
): AbilityScoreMapResolved {
  const out = {} as AbilityScoreMapResolved
  for (const a of ABILITIES) {
    out[a.key] = getAbilityScoreValue(map, a.id) as AbilityScoreValue
  }
  return out
}
