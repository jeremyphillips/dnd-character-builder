import type { AbilityRef } from '@/features/mechanics/domain/character'
import type { EffectConditionId } from '@/features/mechanics/domain/effects/effects.types'
import type { CombatantInstance } from '../types'
import type { ConditionConsequence, AttackModConsequence, SaveModConsequence, DamageInteractionConsequence, SourceRelativeConsequence } from './condition-consequences.types'
import { CONDITION_RULES } from './condition-definitions'

function getActiveConditionIds(combatant: CombatantInstance): EffectConditionId[] {
  const knownIds = new Set<string>(Object.keys(CONDITION_RULES))
  return combatant.conditions
    .filter((m) => knownIds.has(m.label))
    .map((m) => m.label as EffectConditionId)
}

export function getActiveConsequences(combatant: CombatantInstance): ConditionConsequence[] {
  return getActiveConditionIds(combatant).flatMap(
    (id) => CONDITION_RULES[id].consequences,
  )
}

export type ConsequenceWithOrigin = {
  conditionId: EffectConditionId
  consequence: ConditionConsequence
}

export function getActiveConsequencesWithOrigin(
  combatant: CombatantInstance,
): ConsequenceWithOrigin[] {
  return getActiveConditionIds(combatant).flatMap((id) =>
    CONDITION_RULES[id].consequences.map((consequence) => ({ conditionId: id, consequence })),
  )
}

export function canTakeActions(combatant: CombatantInstance): boolean {
  return !getActiveConsequences(combatant).some(
    (c) => c.kind === 'action_limit' && c.cannotTakeActions,
  )
}

export function canTakeReactions(combatant: CombatantInstance): boolean {
  return !getActiveConsequences(combatant).some(
    (c) => c.kind === 'action_limit' && c.cannotTakeReactions,
  )
}

export function getSpeedConsequences(combatant: CombatantInstance): {
  speedBecomesZero: boolean
  standUpCostsHalfMovement: boolean
} {
  const consequences = getActiveConsequences(combatant)
  return {
    speedBecomesZero: consequences.some(
      (c) => c.kind === 'movement' && c.speedBecomesZero,
    ),
    standUpCostsHalfMovement: consequences.some(
      (c) => c.kind === 'movement' && c.standUpCostsHalfMovement,
    ),
  }
}

function collectAttackMods(
  consequences: ConditionConsequence[],
  appliesTo: 'incoming' | 'outgoing',
  range: 'melee' | 'ranged',
): ('advantage' | 'disadvantage')[] {
  return consequences
    .filter(
      (c): c is AttackModConsequence =>
        c.kind === 'attack_mod' &&
        c.appliesTo === appliesTo &&
        (!c.range || c.range === 'any' || c.range === range),
    )
    .map((c) => c.modifier)
}

export function getIncomingAttackModifiers(
  combatant: CombatantInstance,
  range: 'melee' | 'ranged',
): ('advantage' | 'disadvantage')[] {
  return collectAttackMods(getActiveConsequences(combatant), 'incoming', range)
}

export function getOutgoingAttackModifiers(
  combatant: CombatantInstance,
  range: 'melee' | 'ranged',
): ('advantage' | 'disadvantage')[] {
  return collectAttackMods(getActiveConsequences(combatant), 'outgoing', range)
}

function collectSaveMods(
  consequences: ConditionConsequence[],
  ability: AbilityRef,
): SaveModConsequence[] {
  return consequences.filter(
    (c): c is SaveModConsequence =>
      c.kind === 'save_mod' && c.abilities.includes(ability),
  )
}

export function autoFailsSave(combatant: CombatantInstance, ability: AbilityRef): boolean {
  return collectSaveMods(getActiveConsequences(combatant), ability).some(
    (c) => c.modifier === 'auto_fail',
  )
}

export function getSaveModifiersFromConditions(
  combatant: CombatantInstance,
  ability: AbilityRef,
): ('advantage' | 'disadvantage')[] {
  return collectSaveMods(getActiveConsequences(combatant), ability)
    .filter((c): c is SaveModConsequence & { modifier: 'advantage' | 'disadvantage' } =>
      c.modifier === 'advantage' || c.modifier === 'disadvantage',
    )
    .map((c) => c.modifier)
}

export function getDamageResistanceFromConditions(
  combatant: CombatantInstance,
  damageType?: string,
): 'resistance' | 'vulnerability' | null {
  const consequences = getActiveConsequences(combatant)
  const match = consequences.find(
    (c): c is DamageInteractionConsequence =>
      c.kind === 'damage_interaction' &&
      (c.damageType === 'all' || (!!damageType && c.damageType === damageType.trim().toLowerCase())),
  )
  return match?.modifier ?? null
}

export function incomingHitBecomesCrit(combatant: CombatantInstance, distanceFt?: number): boolean {
  if (distanceFt == null) return false
  return getActiveConsequences(combatant).some(
    (c) => c.kind === 'crit_window' && c.becomeCritical && distanceFt <= c.incomingMeleeWithinFt,
  )
}

// ---------------------------------------------------------------------------
// Source-aware condition queries
// ---------------------------------------------------------------------------

export function getConditionSourceIds(
  combatant: CombatantInstance,
  conditionLabel: string,
): string[] {
  return combatant.conditions
    .filter((m) => m.label === conditionLabel && m.sourceInstanceId)
    .map((m) => m.sourceInstanceId!)
}

export function hasConditionFromSource(
  combatant: CombatantInstance,
  conditionLabel: string,
  sourceId: string,
): boolean {
  return combatant.conditions.some(
    (m) => m.label === conditionLabel && m.sourceInstanceId === sourceId,
  )
}

export type SourceRelativeRestriction = {
  sourceId: string
  cannotAttackSource: boolean
  cannotMoveCloserToSource: boolean
}

export function getSourceRelativeRestrictions(
  actor: CombatantInstance,
): SourceRelativeRestriction[] {
  const knownIds = new Set<string>(Object.keys(CONDITION_RULES))
  const restrictions: SourceRelativeRestriction[] = []

  for (const marker of actor.conditions) {
    if (!marker.sourceInstanceId || !knownIds.has(marker.label)) continue

    const rule = CONDITION_RULES[marker.label as EffectConditionId]
    const srcConsequences = rule.consequences.filter(
      (c): c is SourceRelativeConsequence => c.kind === 'source_relative',
    )
    if (srcConsequences.length === 0) continue

    restrictions.push({
      sourceId: marker.sourceInstanceId,
      cannotAttackSource: srcConsequences.some((c) => c.cannotAttackSource === true),
      cannotMoveCloserToSource: srcConsequences.some((c) => c.cannotMoveCloserToSource === true),
    })
  }

  return restrictions
}

export function cannotTargetWithHostileAction(
  actor: CombatantInstance,
  targetId: string,
): boolean {
  return getSourceRelativeRestrictions(actor).some(
    (r) => r.cannotAttackSource && r.sourceId === targetId,
  )
}

// ---------------------------------------------------------------------------
// Visibility / speech / awareness seams
// ---------------------------------------------------------------------------

export function canSpeak(combatant: CombatantInstance): boolean {
  return !getActiveConsequences(combatant).some(
    (c) => c.kind === 'speech' && c.cannotSpeak,
  )
}

export function isAwareOfSurroundings(combatant: CombatantInstance): boolean {
  return !getActiveConsequences(combatant).some(
    (c) => c.kind === 'awareness' && c.unawareOfSurroundings,
  )
}

export function canSee(combatant: CombatantInstance): boolean {
  return !getActiveConsequences(combatant).some(
    (c) => c.kind === 'visibility' && c.cannotSee,
  )
}
