import type { Effect } from '@/features/mechanics/domain/effects/effects.types'
import type { CombatActionDefinition } from '../combat-action.types'
import type { EncounterState } from '../../state/types'
import type { CombatantInstance } from '../../state'
import { isValidActionTarget } from './action-targeting'

/** Phase-1 resolution gates derived from action metadata only (no map execution). */
export type ActionResolutionRequirementKind =
  | 'creature-target'
  | 'area-selection'
  | 'spawn-placement'
  | 'caster-option'
  | 'none'

export type ActionResolutionMissing = {
  kind: ActionResolutionRequirementKind
  message: string
}

export type ActionResolutionReadiness = {
  canResolve: boolean
  missingRequirements: ActionResolutionMissing[]
}

/** Same predicate as `isAreaGridAction` in encounter helpers (kept local to avoid mechanics→encounter import). */
export function isAreaGridCombatAction(action: CombatActionDefinition | undefined | null): boolean {
  return Boolean(action?.targeting?.kind === 'all-enemies' && action.areaTemplate)
}

/**
 * True when resolve flow needs a selected combatant id from the target picker
 * (map/sidebar), matching `getActionTargets` / grid creature targeting.
 */
export function actionRequiresCreatureTargetForResolve(action: CombatActionDefinition | undefined | null): boolean {
  if (!action) return false
  if (isAreaGridCombatAction(action)) return false
  const kind = action.targeting?.kind
  if (kind === 'none' || kind === 'self' || kind === 'all-enemies') return false
  return (
    kind === 'single-target' ||
    kind === 'single-creature' ||
    kind === 'dead-creature' ||
    kind === 'entered-during-move'
  )
}

function hasSpawnEffect(action: CombatActionDefinition): boolean {
  return Boolean(action.effects?.some((e: Effect) => e.kind === 'spawn'))
}

/**
 * Describes what must be satisfied before the encounter UI should enable Resolve.
 * Does not execute resolution — metadata only.
 */
export function getActionResolutionRequirements(action: CombatActionDefinition): ActionResolutionRequirementKind[] {
  const out: ActionResolutionRequirementKind[] = []
  if (isAreaGridCombatAction(action)) {
    out.push('area-selection')
    return out
  }
  if (actionRequiresCreatureTargetForResolve(action)) {
    out.push('creature-target')
  }
  if (action.casterOptions?.length) {
    out.push('caster-option')
  }
  if (hasSpawnEffect(action)) {
    out.push('spawn-placement')
  }
  if (out.length === 0) {
    return ['none']
  }
  return out
}

export type AoeStep = 'none' | 'placing' | 'confirm'

export type ActionResolutionReadinessContext = {
  selectedActionTargetId: string
  aoeStep: AoeStep
  aoeOriginCellId: string | null
  selectedCasterOptions: Record<string, string>
  encounterState: EncounterState | null | undefined
  activeCombatant: CombatantInstance | null | undefined
}

function casterOptionsSatisfied(
  action: CombatActionDefinition,
  selectedCasterOptions: Record<string, string>,
): boolean {
  const fields = action.casterOptions
  if (!fields?.length) return true
  return fields.every((f) => {
    const v = selectedCasterOptions[f.id]
    return v != null && String(v).trim() !== ''
  })
}

function creatureTargetSatisfied(
  action: CombatActionDefinition,
  ctx: ActionResolutionReadinessContext,
): boolean {
  if (!actionRequiresCreatureTargetForResolve(action)) return true
  if (!ctx.selectedActionTargetId) return false
  const { encounterState, activeCombatant } = ctx
  if (!encounterState || !activeCombatant) return false
  const target = encounterState.combatantsById[ctx.selectedActionTargetId]
  if (!target) return false
  return isValidActionTarget(encounterState, target, activeCombatant, action)
}

function areaSelectionSatisfied(
  action: CombatActionDefinition,
  ctx: ActionResolutionReadinessContext,
): boolean {
  if (!isAreaGridCombatAction(action)) return true
  return ctx.aoeStep === 'confirm' && Boolean(ctx.aoeOriginCellId) && Boolean(action.areaTemplate)
}

/** Phase 2: return true when spawn cell / placement exists in selection. */
export function isSpawnPlacementSatisfiedForPhase(_action: CombatActionDefinition): boolean {
  return false
}

/**
 * Evaluates drawer/runtime selection against {@link getActionResolutionRequirements}.
 */
export function getActionResolutionReadiness(
  action: CombatActionDefinition | null | undefined,
  ctx: ActionResolutionReadinessContext,
): ActionResolutionReadiness {
  const missingRequirements: ActionResolutionMissing[] = []
  if (!action) {
    return { canResolve: false, missingRequirements: [] }
  }

  if (isAreaGridCombatAction(action)) {
    if (!areaSelectionSatisfied(action, ctx)) {
      missingRequirements.push({
        kind: 'area-selection',
        message:
          ctx.aoeStep === 'placing'
            ? 'Place the area on the grid'
            : 'Confirm area placement',
      })
    }
    if (!casterOptionsSatisfied(action, ctx.selectedCasterOptions)) {
      missingRequirements.push({ kind: 'caster-option', message: 'Choose spell options' })
    }
    return {
      canResolve: missingRequirements.length === 0,
      missingRequirements,
    }
  }

  const reqs = getActionResolutionRequirements(action)
  for (const kind of reqs) {
    if (kind === 'none') continue
    if (kind === 'creature-target') {
      if (!creatureTargetSatisfied(action, ctx)) {
        missingRequirements.push({
          kind: 'creature-target',
          message: !ctx.selectedActionTargetId ? 'Select a target' : 'Invalid target',
        })
      }
    } else if (kind === 'caster-option') {
      if (!casterOptionsSatisfied(action, ctx.selectedCasterOptions)) {
        missingRequirements.push({ kind: 'caster-option', message: 'Choose spell options' })
      }
    } else if (kind === 'spawn-placement') {
      if (!isSpawnPlacementSatisfiedForPhase(action)) {
        missingRequirements.push({
          kind: 'spawn-placement',
          message: 'Spawn placement not available yet — choose a map cell in a future update',
        })
      }
    }
  }

  return {
    canResolve: missingRequirements.length === 0,
    missingRequirements,
  }
}

/** Primary missing gate for CTA/header copy (first failure in requirement order). */
export function getPrimaryResolutionMissing(
  action: CombatActionDefinition | null | undefined,
  ctx: ActionResolutionReadinessContext,
): ActionResolutionMissing | null {
  const { missingRequirements } = getActionResolutionReadiness(action, ctx)
  return missingRequirements[0] ?? null
}
