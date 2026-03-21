import type { EncounterState } from './types'
import type { CombatantInstance } from './types'
import { canSee } from './condition-rules/condition-queries'

/** State marker from the See Invisibility spell (`stateId: 'see-invisibility'`). */
const SEE_INVISIBILITY_STATE_LABEL = 'see-invisibility'

function hasInvisibleCondition(c: CombatantInstance): boolean {
  return c.conditions.some((m) => m.label === 'invisible')
}

function hasSeeInvisibilityState(c: CombatantInstance): boolean {
  return c.states.some((s) => s.label === SEE_INVISIBILITY_STATE_LABEL)
}

/**
 * Line-of-sight geometry stub: no grid, terrain, or positions. Always `true` until a real
 * implementation replaces this without changing call sites.
 */
export function lineOfSightClear(
  _observerId: string,
  _targetId: string,
  _state: EncounterState,
): boolean {
  return true
}

/**
 * Line-of-effect geometry stub (cover, walls, etc.). Same contract as {@link lineOfSightClear}.
 */
export function lineOfEffectClear(
  _observerId: string,
  _targetId: string,
  _state: EncounterState,
): boolean {
  return true
}

/**
 * Whether `observer` may select `target` for effects that require sight (e.g. “a creature you can see”).
 * Combines {@link canSee} (blinded / visibility consequences), invisible vs See Invisibility, and LOS/LoE stubs.
 */
export function canSeeForTargeting(
  state: EncounterState,
  observerId: string,
  targetId: string,
): boolean {
  const observer = state.combatantsById[observerId]
  const target = state.combatantsById[targetId]
  if (!observer || !target) return false
  if (!canSee(observer)) return false
  if (hasInvisibleCondition(target) && !hasSeeInvisibilityState(observer)) {
    return false
  }
  if (!lineOfSightClear(observerId, targetId, state)) return false
  if (!lineOfEffectClear(observerId, targetId, state)) return false
  return true
}
