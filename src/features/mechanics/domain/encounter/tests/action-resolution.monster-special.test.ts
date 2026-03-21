import { describe, expect, it } from 'vitest'

import { getCombatantAvailableActions, resolveCombatAction } from '../resolution'
import { advanceEncounterTurn, createEncounterState } from '../state'

import { createCombatant } from './action-resolution.test-helpers'

describe('resolveCombatAction — monster sequences, recharge, and on-hit riders', () => {
  it('expands sequence actions using tracked part counts', () => {
    const state = createEncounterState(
      [
        {
          ...createCombatant({
            instanceId: 'hydra',
            label: 'Hydra',
            side: 'enemies',
            initiativeModifier: 5,
            dexterityScore: 12,
            armorClass: 15,
            actions: [
              {
                id: 'multiattack',
                label: 'Multiattack',
                kind: 'monster-action',
                cost: { action: true },
                resolutionMode: 'log-only',
                sequence: [
                  {
                    actionLabel: 'Bite',
                    count: 5,
                    countFromTrackedPart: 'head',
                  },
                ],
              },
              {
                id: 'bite',
                label: 'Bite',
                kind: 'monster-action',
                cost: { action: true },
                resolutionMode: 'attack-roll',
                attackProfile: {
                  attackBonus: 8,
                  damage: '1',
                  damageType: 'piercing',
                },
              },
            ],
          }),
          trackedParts: [
            {
              part: 'head',
              currentCount: 2,
              initialCount: 5,
              lostSinceLastTurn: 0,
              lossAppliedThisTurn: 0,
              damageTakenThisTurn: 0,
              damageTakenByTypeThisTurn: {},
              regrowthSuppressedByDamageTypes: [],
            },
          ],
        },
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

    const resolved = resolveCombatAction(
      state,
      {
        actorId: 'hydra',
        targetId: 'target',
        actionId: 'multiattack',
      },
      {
        rng: () => 0.7,
      },
    )

    expect(resolved.combatantsById['target']?.stats.currentHitPoints).toBe(10)
    expect(resolved.combatantsById['hydra']?.turnResources?.actionAvailable).toBe(false)
    expect(resolved.log.filter((entry) => entry.summary.includes('Hydra hits Fighter with Bite.'))).toHaveLength(2)
    expect(resolved.log[resolved.log.length - 1]?.summary).toBe('Multiattack resolves its action sequence.')
  })

  it('recharges monster actions at the start of their turn before they become available again', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'dragon',
          label: 'Dragon',
          side: 'enemies',
          initiativeModifier: 8,
          dexterityScore: 14,
          armorClass: 18,
          actions: [
            {
              id: 'fire-breath',
              label: 'Fire Breath',
              kind: 'monster-action',
              cost: { action: true },
              resolutionMode: 'saving-throw',
              damage: '8d6',
              damageType: 'fire',
              saveProfile: {
                ability: 'dex',
                dc: 17,
                halfDamageOnSave: true,
              },
              targeting: { kind: 'all-enemies' },
              usage: {
                recharge: {
                  min: 5,
                  max: 6,
                  ready: true,
                },
              },
            },
          ],
        }),
        createCombatant({
          instanceId: 'fighter',
          label: 'Fighter',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 10,
          armorClass: 16,
          savingThrowModifiers: { dexterity: 0 },
        }),
      ],
      { rng: () => 0.1 },
    )

    const spent = resolveCombatAction(
      state,
      {
        actorId: 'dragon',
        actionId: 'fire-breath',
      },
      {
        rng: () => 0.1,
      },
    )

    expect(getCombatantAvailableActions(spent, 'dragon').map((action) => action.id)).not.toContain('fire-breath')

    const toFighter = advanceEncounterTurn(spent, { rng: () => 0.1 })
    const recharged = advanceEncounterTurn(toFighter, { rng: () => 0.9 })

    expect(recharged.activeCombatantId).toBe('dragon')
    expect(
      recharged.combatantsById['dragon']?.actions?.find((action) => action.id === 'fire-breath')?.usage?.recharge?.ready,
    ).toBe(true)
    expect(getCombatantAvailableActions(recharged, 'dragon').map((action) => action.id)).toContain('fire-breath')
  })

  it('executes on-hit rider saves for attack-roll monster actions', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'wolf',
          label: 'Wolf',
          side: 'enemies',
          initiativeModifier: 5,
          dexterityScore: 15,
          armorClass: 13,
          actions: [
            {
              id: 'bite',
              label: 'Bite',
              kind: 'monster-action',
              cost: { action: true },
              resolutionMode: 'attack-roll',
              attackProfile: {
                attackBonus: 4,
                damage: '2d4 + 2',
                damageType: 'piercing',
              },
              onHitEffects: [
                {
                  kind: 'save',
                  save: { ability: 'str', dc: 11 },
                  onFail: [{ kind: 'condition', conditionId: 'prone' }],
                },
              ],
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Cleric',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 12,
          abilityScores: { strength: 10 },
        }),
      ],
      { rng: () => 0.9 },
    )

    const resolved = resolveCombatAction(
      state,
      {
        actorId: 'wolf',
        targetId: 'target',
        actionId: 'bite',
      },
      {
        rng: (() => {
          const rolls = [0.5, 0.1, 0.1]
          let index = 0
          return () => rolls[index++] ?? 0.1
        })(), // hit, low damage, then fail STR save
      },
    )

    expect(resolved.combatantsById['target']?.conditions.map((marker) => marker.label)).toContain('prone')
  })

  it('uses attack-roll onSuccess branches as on-hit effects for monster special actions', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'bugbear',
          label: 'Bugbear',
          side: 'enemies',
          initiativeModifier: 5,
          dexterityScore: 14,
          armorClass: 15,
          actions: [
            {
              id: 'grab',
              label: 'Grab',
              kind: 'monster-action',
              cost: { action: true },
              resolutionMode: 'attack-roll',
              attackProfile: {
                attackBonus: 4,
                damage: '2d6 + 2',
                damageType: 'bludgeoning',
              },
              onHitEffects: [
                {
                  kind: 'condition',
                  conditionId: 'grappled',
                  targetSizeMax: 'medium',
                  escapeDc: 12,
                },
              ],
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Rogue',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 12,
        }),
      ],
      { rng: () => 0.9 },
    )

    const resolved = resolveCombatAction(
      state,
      {
        actorId: 'bugbear',
        targetId: 'target',
        actionId: 'grab',
      },
      {
        rng: (() => {
          const rolls = [0.5, 0.2, 0.2]
          let index = 0
          return () => rolls[index++] ?? 0.2
        })(),
      },
    )

    expect(resolved.combatantsById['target']?.conditions.map((marker) => marker.label)).toContain('grappled')
  })
})
