import { describe, expect, it } from 'vitest'

import { getCombatantAvailableActions, resolveCombatAction } from '../resolution'
import { createEncounterState } from '../state'

import { createCombatant } from './action-resolution.test-helpers'

describe('resolveCombatAction — weapon attacks and turn resources', () => {
  it('hits a target, applies damage, spends the action, and keeps the same active turn', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'actor',
          label: 'Fighter',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 16,
          armorClass: 16,
          actions: [
            {
              id: 'slash',
              label: 'Slash',
              kind: 'weapon-attack',
              cost: { action: true },
              resolutionMode: 'attack-roll',
              attackProfile: {
                attackBonus: 5,
                damage: '1d6 + 2',
                damageType: 'slashing',
              },
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 13,
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolved = resolveCombatAction(
      state,
      { actorId: 'actor', targetId: 'target', actionId: 'slash' },
      {
        rng: () => 0.7, // d20 = 15, d6 = 5
      },
    )

    expect(resolved.activeCombatantId).toBe('actor')
    expect(resolved.combatantsById['target']?.stats.currentHitPoints).toBe(5)
    expect(resolved.combatantsById['actor']?.turnResources?.actionAvailable).toBe(false)
    expect(resolved.log.slice(-4).map((entry) => entry.type)).toEqual([
      'action-declared',
      'attack-hit',
      'damage-applied',
      'action-resolved',
    ])
  })

  it('misses without applying damage but still spends the action', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'actor',
          label: 'Fighter',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 16,
          armorClass: 16,
          actions: [
            {
              id: 'slash',
              label: 'Slash',
              kind: 'weapon-attack',
              cost: { action: true },
              resolutionMode: 'attack-roll',
              attackProfile: {
                attackBonus: 2,
                damage: '7',
                damageType: 'slashing',
              },
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 20,
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolved = resolveCombatAction(
      state,
      { actorId: 'actor', targetId: 'target', actionId: 'slash' },
      {
        rng: () => 0.2, // d20 = 5
      },
    )

    expect(resolved.combatantsById['target']?.stats.currentHitPoints).toBe(12)
    expect(resolved.combatantsById['actor']?.turnResources?.actionAvailable).toBe(false)
    expect(resolved.log.slice(-3).map((entry) => entry.type)).toEqual([
      'action-declared',
      'attack-missed',
      'action-resolved',
    ])
  })

  it('blocks repeated action use in the same turn', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'actor',
          label: 'Fighter',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 16,
          armorClass: 16,
          actions: [
            {
              id: 'slash',
              label: 'Slash',
              kind: 'weapon-attack',
              cost: { action: true },
              resolutionMode: 'attack-roll',
              attackProfile: {
                attackBonus: 5,
                damage: '5',
                damageType: 'slashing',
              },
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 10,
        }),
      ],
      { rng: () => 0.1 },
    )

    const first = resolveCombatAction(
      state,
      { actorId: 'actor', targetId: 'target', actionId: 'slash' },
      { rng: () => 0.7 },
    )
    const second = resolveCombatAction(
      first,
      { actorId: 'actor', targetId: 'target', actionId: 'slash' },
      { rng: () => 0.7 },
    )

    expect(getCombatantAvailableActions(first, 'actor')).toEqual([])
    expect(second).toEqual(first)
  })

  it('enforces limited-use monster actions after their uses are spent', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'actor',
          label: 'Gnoll',
          side: 'enemies',
          initiativeModifier: 5,
          dexterityScore: 14,
          armorClass: 15,
          actions: [
            {
              id: 'rampage',
              label: 'Rampage',
              kind: 'monster-action',
              cost: { bonusAction: true },
              resolutionMode: 'log-only',
              usage: {
                uses: {
                  max: 1,
                  remaining: 1,
                  period: 'day',
                },
              },
              logText: 'The gnoll surges forward.',
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Guard',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 12,
        }),
      ],
      { rng: () => 0.1 },
    )

    expect(getCombatantAvailableActions(state, 'actor').map((action) => action.id)).toContain('rampage')

    const resolved = resolveCombatAction(state, {
      actorId: 'actor',
      actionId: 'rampage',
    })

    expect(
      resolved.combatantsById['actor']?.actions?.find((action) => action.id === 'rampage')?.usage?.uses?.remaining,
    ).toBe(0)
    expect(getCombatantAvailableActions(resolved, 'actor').map((action) => action.id)).not.toContain('rampage')
  })

  it('logs placeholder spell actions without changing hit points', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'actor',
          label: 'Wizard',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 16,
          armorClass: 12,
          actions: [
            {
              id: 'magic-missile-note',
              label: 'Magic Missile',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'log-only',
              logText: 'Three glowing darts strike automatically.',
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 13,
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolved = resolveCombatAction(state, {
      actorId: 'actor',
      targetId: 'target',
      actionId: 'magic-missile-note',
    })

    expect(resolved.combatantsById['target']?.stats.currentHitPoints).toBe(12)
    expect(resolved.combatantsById['actor']?.turnResources?.actionAvailable).toBe(false)
    expect(resolved.log.slice(-2).map((entry) => entry.type)).toEqual(['action-declared', 'spell-logged'])
  })

  it('spends only the bonus action for bonus-action log entries', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'actor',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 5,
          dexterityScore: 16,
          armorClass: 15,
          actions: [
            {
              id: 'nimble-escape',
              label: 'Nimble Escape',
              kind: 'monster-action',
              cost: { bonusAction: true },
              resolutionMode: 'log-only',
              logText: 'The goblin takes the Disengage or Hide action.',
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Fighter',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 16,
        }),
      ],
      { rng: () => 0.9 },
    )

    const resolved = resolveCombatAction(state, {
      actorId: 'actor',
      actionId: 'nimble-escape',
      targetId: 'target',
    })

    expect(resolved.combatantsById['actor']?.turnResources).toEqual({
      actionAvailable: true,
      bonusActionAvailable: false,
      reactionAvailable: true,
      opportunityAttackReactionsRemaining: 0,
      movementRemaining: 30,
      hasCastBonusActionSpell: false,
    })
    expect(resolved.log.slice(-2).map((entry) => entry.type)).toEqual(['action-declared', 'action-resolved'])
  })
})
