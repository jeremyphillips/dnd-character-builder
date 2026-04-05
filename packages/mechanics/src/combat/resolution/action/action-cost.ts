import type { CombatActionCost, CombatActionDefinition } from '../combat-action.types'
import {
  createCombatTurnResources,
  type CombatantInstance,
  type CombatantTurnResources,
} from '../../state'

/** Persisted or adapter-built actions may omit `cost`; treat as no action-economy spend. */
const EMPTY_COST: CombatActionCost = {}

export function spendActionCost(
  resources: CombatantTurnResources,
  cost: CombatActionCost | undefined,
): CombatantTurnResources {
  const c = cost ?? EMPTY_COST
  return {
    ...resources,
    actionAvailable: c.action ? false : resources.actionAvailable,
    bonusActionAvailable: c.bonusAction ? false : resources.bonusActionAvailable,
    reactionAvailable: c.reaction ? false : resources.reactionAvailable,
    movementRemaining:
      c.movementFeet != null
        ? Math.max(0, resources.movementRemaining - c.movementFeet)
        : resources.movementRemaining,
  }
}

export function getCombatantTurnResources(combatant: CombatantInstance): CombatantTurnResources {
  return combatant.turnResources ?? createCombatTurnResources()
}

export function canSpendActionCost(
  resources: CombatantTurnResources,
  cost: CombatActionCost | undefined,
): boolean {
  const c = cost ?? EMPTY_COST
  if (c.action && !resources.actionAvailable) return false
  if (c.bonusAction && !resources.bonusActionAvailable) return false
  if (c.reaction && !resources.reactionAvailable) return false
  if (c.movementFeet != null && resources.movementRemaining < c.movementFeet) return false
  return true
}

/**
 * Check if an action can be used (recharge ready, uses remaining).
 *
 * KNOWN EDGE CASES:
 * - Warlock pact: period 'short-rest' not yet modeled; would need separate check.
 */
export function canUseCombatAction(action: CombatActionDefinition): boolean {
  if (action.usage?.recharge && !action.usage.recharge.ready) return false
  if (action.usage?.uses && action.usage.uses.remaining <= 0) return false
  return true
}

export function spendCombatActionUsage(
  action: CombatActionDefinition,
): CombatActionDefinition {
  if (!action.usage) return action

  return {
    ...action,
    usage: {
      recharge: action.usage.recharge
        ? {
            ...action.usage.recharge,
            ready: false,
          }
        : undefined,
      uses: action.usage.uses
        ? {
            ...action.usage.uses,
            remaining: Math.max(0, action.usage.uses.remaining - 1),
          }
        : undefined,
    },
  }
}
