import type { CombatActionDefinition } from '@/features/mechanics/domain/encounter/resolution/combat-action.types'
import { isHostileAction } from '@/features/mechanics/domain/encounter'

/**
 * Heuristic hint for why an action row is disabled in the drawer.
 *
 * Returns a short user-facing string (suitable for a caption line) or `null`
 * when the action is available. The hint is derived from data already present
 * on `CombatActionDefinition` — no encounter-state access required.
 */
export function deriveActionUnavailableHint(
  action: CombatActionDefinition,
  availableActionIds: Set<string> | undefined,
  validActionIdsForTarget: Set<string> | undefined,
): string | null {
  const allTreatAsAvailable = availableActionIds == null
  const resourceAvailable = allTreatAsAvailable || availableActionIds!.has(action.id)

  if (!resourceAvailable) {
    return deriveResourceHint(action)
  }

  const validForTarget = validActionIdsForTarget == null || validActionIdsForTarget.has(action.id)
  if (!validForTarget) {
    return deriveTargetHint(action, validActionIdsForTarget)
  }

  return null
}

function deriveResourceHint(action: CombatActionDefinition): string {
  if (action.usage?.uses && action.usage.uses.remaining <= 0) {
    return 'No uses remaining'
  }
  if (action.usage?.recharge && !action.usage.recharge.ready) {
    return 'Recharge not ready'
  }
  if (action.cost.bonusAction) return 'Bonus action spent this turn'
  return 'Action spent this turn'
}

function deriveTargetHint(
  action: CombatActionDefinition,
  validActionIdsForTarget: Set<string> | undefined,
): string {
  if (validActionIdsForTarget == null) return 'No target selected'

  const kind = action.targeting?.kind
  if (kind === 'self') return 'Self-only ability'
  if (kind === 'none') return 'No target required'
  if (action.targeting?.requiresWilling) return 'Requires willing ally'
  if (isHostileAction(action)) return 'Requires enemy target'
  if (action.targeting?.rangeFt != null) return 'Target out of range'
  if (action.areaTemplate) return 'Requires area placement'
  return 'Not valid for this target'
}
