import type { CombatActionDefinition, CombatActionSequenceStep } from '../combat-action.types'
import type { CombatantInstance } from '../../state'
import type { EncounterState } from '../../state/types'
import type { ResolveCombatActionSelection } from '../action-resolution.types'

export function getTrackedPartCount(
  state: EncounterState,
  actorId: string,
  part: 'head' | 'limb',
): number {
  return state.combatantsById[actorId]?.trackedParts?.find(
    (trackedPart) => trackedPart.part === part,
  )?.currentCount ?? 0
}

export function getSequenceStepCount(
  state: EncounterState,
  actorId: string,
  step: CombatActionSequenceStep,
): number {
  if (step.countFromTrackedPart) {
    return getTrackedPartCount(state, actorId, step.countFromTrackedPart)
  }

  return step.count
}

function passesCreatureTypeFilter(
  combatant: CombatantInstance,
  filter: string[] | undefined,
): boolean {
  if (!filter || filter.length === 0) return true
  return !!combatant.creatureType && filter.includes(combatant.creatureType)
}

export function isHostileAction(action: CombatActionDefinition): boolean {
  const kind = action.targeting?.kind
  return !kind || kind === 'single-target' || kind === 'all-enemies' || kind === 'entered-during-move'
}

export function getCharmedSourceIds(combatant: CombatantInstance): string[] {
  return combatant.conditions
    .filter((m) => m.label === 'charmed' && m.sourceInstanceId)
    .map((m) => m.sourceInstanceId!)
}

export function getActionTargets(
  state: EncounterState,
  actor: CombatantInstance,
  selection: ResolveCombatActionSelection,
  action: CombatActionDefinition,
): CombatantInstance[] {
  const creatureTypeFilter = action.targeting?.creatureTypeFilter
  const charmedSourceIds = isHostileAction(action) ? getCharmedSourceIds(actor) : []

  function isValidTarget(combatant: CombatantInstance): boolean {
    if (!passesCreatureTypeFilter(combatant, creatureTypeFilter)) return false
    if (charmedSourceIds.includes(combatant.instanceId)) return false
    return true
  }

  if (action.targeting?.kind === 'self') {
    return [actor]
  }

  if (action.targeting?.kind === 'all-enemies') {
    return Object.values(state.combatantsById).filter(
      (combatant) =>
        combatant.side !== actor.side &&
        combatant.stats.currentHitPoints > 0 &&
        isValidTarget(combatant),
    )
  }

  if (action.targeting?.kind === 'single-creature') {
    if (!selection.targetId) return [actor]
    const target = state.combatantsById[selection.targetId]
    if (!target || target.stats.currentHitPoints <= 0) return []
    if (!isValidTarget(target)) return []
    return [target]
  }

  if (action.targeting?.kind === 'dead-creature') {
    if (!selection.targetId) return []
    const target = state.combatantsById[selection.targetId]
    if (!target || target.stats.currentHitPoints > 0) return []
    return [target]
  }

  if (!selection.targetId) return []
  const target = state.combatantsById[selection.targetId]
  if (!target || target.side === actor.side || target.stats.currentHitPoints <= 0) return []
  if (!isValidTarget(target)) return []
  return [target]
}
