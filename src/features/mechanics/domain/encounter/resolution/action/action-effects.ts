import {
  addConditionToCombatant,
  addRollModifierToCombatant,
  addStateToCombatant,
  addStatModifierToCombatant,
  applyDamageToCombatant,
  applyHealingToCombatant,
  appendEncounterNote,
  effectDurationToRuntimeDuration,
  updateEncounterCombatant,
  type CombatantInstance,
} from '../../state'
import { getAbilityModifier } from '../../../abilities/getAbilityModifier'
import { abilityIdToKey, type AbilityRef } from '../../../character'
import type { Effect } from '../../../effects/effects.types'
import type { CombatActionDefinition } from '../combat-action.types'
import type { EncounterState } from '../../state/types'
import { rollDie, rollDamage, rollHealing } from '../../../resolution/engines/dice.engine'

export function getSaveModifier(combatant: CombatantInstance, ability: AbilityRef): number {
  const abilityKey = abilityIdToKey(ability)
  return (
    combatant.stats.savingThrowModifiers?.[abilityKey] ??
    getAbilityModifier(combatant.stats.abilityScores?.[abilityKey] ?? 10)
  )
}

export function getImmunityStateLabel(actionLabel: string): string {
  return `immune to ${actionLabel}`
}

export function formatMovementSummary(effect: {
  upToSpeed?: boolean
  upToSpeedFraction?: 0.5 | 1
  noOpportunityAttacks?: boolean
  canEnterCreatureSpaces?: boolean
  targetSizeMax?: string
  straightTowardVisibleEnemy?: boolean
  forced?: boolean
  toNearestUnoccupiedSpace?: boolean
  withinFeetOfSource?: number
  failIfNoSpace?: boolean
  movesWithSource?: boolean
}): string {
  const parts: string[] = []

  if (effect.upToSpeed) {
    parts.push('move up to its Speed')
  } else if (effect.upToSpeedFraction != null) {
    parts.push(`move up to ${effect.upToSpeedFraction * 100}% of its Speed`)
  }

  if (effect.noOpportunityAttacks) {
    parts.push('without provoking opportunity attacks')
  }

  if (effect.canEnterCreatureSpaces) {
    const sizeLimit = effect.targetSizeMax ? `${effect.targetSizeMax} or smaller` : 'eligible'
    parts.push(`may enter ${sizeLimit} creature spaces`)
  }

  if (effect.straightTowardVisibleEnemy) {
    parts.push('must move straight toward a visible enemy')
  }

  if (effect.movesWithSource) {
    parts.push('target moves with the source')
  }

  if (effect.forced) {
    parts.push('forced movement')
  }

  if (effect.withinFeetOfSource != null) {
    parts.push(`ends within ${effect.withinFeetOfSource} feet of the source`)
  }

  if (effect.toNearestUnoccupiedSpace) {
    parts.push('moves to the nearest unoccupied space')
  }

  if (effect.failIfNoSpace) {
    parts.push('fails if no space is available')
  }

  return parts.length > 0 ? `${parts.join('; ')}.` : 'Movement effect noted.'
}

function formatNestedEffectSummary(effect: Effect): string | null {
  if (effect.kind === 'condition') {
    return `Condition: ${effect.conditionId}.`
  }

  if (effect.kind === 'damage') {
    return `Damage: ${effect.damage}${effect.damageType ? ` ${effect.damageType}` : ''}.`
  }

  if (effect.kind === 'note') {
    return effect.text
  }

  if (effect.kind === 'move') {
    return formatMovementSummary(effect)
  }

  return null
}

export function applyActionEffects(
  state: EncounterState,
  actor: CombatantInstance,
  target: CombatantInstance,
  action: CombatActionDefinition,
  effects: Effect[] | undefined,
  options: { rng: () => number; sourceLabel: string },
): EncounterState {
  if (!effects || effects.length === 0) return state

  let nextState = state

  effects.forEach((effect) => {
    if (effect.kind === 'save') {
      if (typeof effect.save.dc !== 'number') {
        nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Unsupported save DC rule.`, {
          actorId: actor.instanceId,
          targetIds: [target.instanceId],
        })
        return
      }

      const rawRoll = rollDie(20, options.rng)
      const saveModifier = getSaveModifier(target, effect.save.ability)
      const totalRoll = rawRoll + saveModifier
      const succeeded = totalRoll >= effect.save.dc

      nextState = appendEncounterNote(
        nextState,
        `${options.sourceLabel}: ${target.source.label} ${succeeded ? 'succeeds' : 'fails'} the ${effect.save.ability.toUpperCase()} save.`,
        {
          actorId: actor.instanceId,
          targetIds: [target.instanceId],
          details: `Saving throw: d20 ${rawRoll} + ${saveModifier} = ${totalRoll} vs DC ${effect.save.dc}.`,
        },
      )

      nextState = applyActionEffects(
        nextState,
        actor,
        target,
        action,
        succeeded ? effect.onSuccess : effect.onFail,
        options,
      )
      return
    }

    if (effect.kind === 'damage') {
      const rolledDamage = rollDamage(String(effect.damage), options.rng)
      if (rolledDamage && rolledDamage.total > 0) {
        nextState = applyDamageToCombatant(nextState, target.instanceId, rolledDamage.total, {
          actorId: actor.instanceId,
          sourceLabel: options.sourceLabel,
          damageType: effect.damageType,
        })
      }
      return
    }

    if (effect.kind === 'hit-points') {
      const resolved = rollHealing(String(effect.value), options.rng)
      if (resolved && resolved.total > 0) {
        if (effect.mode === 'heal') {
          nextState = applyHealingToCombatant(nextState, target.instanceId, resolved.total, {
            actorId: actor.instanceId,
            sourceLabel: options.sourceLabel,
          })
        } else {
          nextState = applyDamageToCombatant(nextState, target.instanceId, resolved.total, {
            actorId: actor.instanceId,
            sourceLabel: options.sourceLabel,
          })
        }
      }
      return
    }

    if (effect.kind === 'condition') {
      nextState = addConditionToCombatant(nextState, target.instanceId, effect.conditionId, {
        sourceLabel: options.sourceLabel,
        sourceInstanceId: actor.instanceId,
      })
      return
    }

    if (effect.kind === 'state') {
      nextState = addStateToCombatant(nextState, target.instanceId, effect.stateId, {
        sourceLabel: options.sourceLabel,
      })

      if (effect.escape) {
        nextState = appendEncounterNote(
          nextState,
          `${options.sourceLabel}: Escape DC ${effect.escape.dc} ${effect.escape.ability?.toUpperCase() ?? ''}${effect.escape.skill ? ` (${effect.escape.skill})` : ''}${effect.escape.actionRequired ? ' as an action' : ''}.`
            .replace(/\s+/g, ' ')
            .trim(),
          {
            actorId: actor.instanceId,
            targetIds: [target.instanceId],
          },
        )
      }

      if (effect.notes) {
        nextState = appendEncounterNote(nextState, `${options.sourceLabel}: ${effect.notes}`, {
          actorId: actor.instanceId,
          targetIds: [target.instanceId],
        })
      }

      if (effect.ongoingEffects && effect.ongoingEffects.length > 0) {
        nextState = updateEncounterCombatant(nextState, target.instanceId, (combatant) => ({
          ...combatant,
          turnHooks: [
            ...combatant.turnHooks,
            {
              id: `ongoing-${effect.stateId}-${action.id}-${target.instanceId}`,
              label: `${options.sourceLabel}: ${effect.stateId} (ongoing)`,
              boundary: 'start' as const,
              effects: effect.ongoingEffects!,
            },
          ],
        }))
        const ongoingSummary = effect.ongoingEffects
          .map((nestedEffect) => formatNestedEffectSummary(nestedEffect))
          .filter((summary): summary is string => Boolean(summary))
          .join(' ')
        if (ongoingSummary) {
          nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Ongoing — ${ongoingSummary}`, {
            actorId: actor.instanceId,
            targetIds: [target.instanceId],
          })
        }
      }
      return
    }

    if (effect.kind === 'modifier' && typeof effect.value === 'number' && (effect.mode === 'add' || effect.mode === 'set')) {
      const runtimeDuration = effectDurationToRuntimeDuration(effect) ?? undefined
      const sign = effect.mode === 'add' && effect.value > 0 ? '+' : ''
      const modeLabel = effect.mode === 'set' ? `set ${effect.target} ${effect.value}` : `${sign}${effect.value} ${effect.target}`
      nextState = addStatModifierToCombatant(
        nextState,
        target.instanceId,
        {
          id: `stat-mod-${effect.target}-${action.id}-${target.instanceId}`,
          label: modeLabel,
          target: effect.target,
          mode: effect.mode,
          value: effect.value,
          duration: runtimeDuration,
        },
        { sourceLabel: options.sourceLabel },
      )
      return
    }

    if (effect.kind === 'roll-modifier') {
      const runtimeDuration = effectDurationToRuntimeDuration(effect) ?? undefined
      nextState = addRollModifierToCombatant(
        nextState,
        target.instanceId,
        {
          id: `roll-mod-${action.id}-${target.instanceId}`,
          label: `${effect.modifier} on ${Array.isArray(effect.appliesTo) ? effect.appliesTo.join(', ') : effect.appliesTo}`,
          appliesTo: effect.appliesTo,
          modifier: effect.modifier,
          duration: runtimeDuration,
          sourceInstanceId: actor.instanceId,
        },
        { sourceLabel: options.sourceLabel },
      )
      return
    }

    if (effect.kind === 'immunity' && effect.scope === 'spell') {
      const runtimeDuration = effectDurationToRuntimeDuration(effect) ?? undefined
      const stateLabel = `Immune: ${effect.spellIds.join(', ')}`
      nextState = addStateToCombatant(nextState, target.instanceId, stateLabel, {
        duration: runtimeDuration,
        sourceLabel: options.sourceLabel,
      })
      return
    }

    if (effect.kind === 'immunity' && effect.scope === 'source-action') {
      nextState = addStateToCombatant(nextState, target.instanceId, getImmunityStateLabel(action.label), {
        sourceLabel: options.sourceLabel,
      })
      return
    }

    if (effect.kind === 'death-outcome') {
      if (target.stats.currentHitPoints <= 0) {
        nextState = appendEncounterNote(nextState, `${options.sourceLabel}: ${target.source.label} ${effect.outcome.replaceAll('-', ' ')}.`, {
          actorId: actor.instanceId,
          targetIds: [target.instanceId],
        })
      }
      return
    }

    if (effect.kind === 'interval') {
      const boundary = effect.every.unit === 'turn' ? 'start' : 'end'
      nextState = updateEncounterCombatant(nextState, target.instanceId, (combatant) => ({
        ...combatant,
        turnHooks: [
          ...combatant.turnHooks,
          {
            id: `interval-${effect.stateId}-${action.id}-${target.instanceId}`,
            label: `${options.sourceLabel}: ${effect.stateId}`,
            boundary: boundary as 'start' | 'end',
            effects: effect.effects,
          },
        ],
      }))
      nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Interval effect ${effect.stateId} registered (${boundary} of turn).`, {
        actorId: actor.instanceId,
        targetIds: [target.instanceId],
      })
      return
    }

    if (effect.kind === 'move') {
      nextState = appendEncounterNote(nextState, `${options.sourceLabel}: ${formatMovementSummary(effect)}`, {
        actorId: actor.instanceId,
        targetIds: [target.instanceId],
      })
      return
    }

    if (effect.kind === 'note') {
      nextState = appendEncounterNote(nextState, `${options.sourceLabel}: ${effect.text}`, {
        actorId: actor.instanceId,
        targetIds: [target.instanceId],
      })
      return
    }

    if (effect.kind === 'trigger') {
      nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Trigger effect (${effect.trigger}) noted. Reactive effects require manual adjudication.`, {
        actorId: actor.instanceId,
        targetIds: [target.instanceId],
      })
      return
    }

    if (effect.kind === 'activation') {
      nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Activation effect (${effect.activation}) noted for future use.`, {
        actorId: actor.instanceId,
        targetIds: [target.instanceId],
      })
      return
    }

    if (effect.kind === 'check') {
      nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Check DC ${effect.check.dc} ${effect.check.ability.toUpperCase()}${effect.check.skill ? ` (${effect.check.skill})` : ''} required.`, {
        actorId: actor.instanceId,
        targetIds: [target.instanceId],
      })
      return
    }

    if (effect.kind === 'grant') {
      nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Grants ${effect.grantType}.`, {
        actorId: actor.instanceId,
        targetIds: [target.instanceId],
      })
      return
    }

    if (effect.kind === 'form') {
      nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Form change to ${effect.form}${effect.notes ? ` — ${effect.notes}` : ''}.`, {
        actorId: actor.instanceId,
        targetIds: [target.instanceId],
      })
      return
    }

    if (effect.kind === 'targeting') {
      return
    }

    nextState = appendEncounterNote(nextState, `${options.sourceLabel}: Unsupported effect ${effect.kind}.`, {
      actorId: actor.instanceId,
      targetIds: [target.instanceId],
    })
  })

  return nextState
}
