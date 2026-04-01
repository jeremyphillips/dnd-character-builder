import { describe, expect, it } from 'vitest'

import { resolveCombatAction } from '../resolution'
import { createEncounterState } from '../state'

import { createCombatant } from './action-resolution.test-helpers'

describe('resolveCombatAction — saving throws and area monster actions', () => {
  it('resolves single-target saving throw actions and applies branch effects', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'mummy',
          label: 'Mummy',
          side: 'enemies',
          initiativeModifier: 5,
          dexterityScore: 8,
          armorClass: 12,
          actions: [
            {
              id: 'dreadful-glare',
              label: 'Dreadful Glare',
              kind: 'monster-action',
              cost: { action: true },
              resolutionMode: 'saving-throw',
              saveProfile: {
                ability: 'wis',
                dc: 11,
              },
              onFailEffects: [{ kind: 'condition', conditionId: 'frightened' }],
              onSuccessEffects: [
                {
                  kind: 'immunity',
                  scope: 'source-action',
                  duration: { kind: 'fixed', value: 24, unit: 'hour' },
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
          armorClass: 16,
          abilityScores: { wisdom: 10 },
        }),
      ],
      { rng: () => 0.9 },
    )

    const failed = resolveCombatAction(
      state,
      {
        actorId: 'mummy',
        targetId: 'target',
        actionId: 'dreadful-glare',
      },
      {
        rng: () => 0.2,
      },
    )

    expect(failed.combatantsById['target']?.conditions.map((marker) => marker.label)).toContain('frightened')

    const succeeded = resolveCombatAction(
      state,
      {
        actorId: 'mummy',
        targetId: 'target',
        actionId: 'dreadful-glare',
      },
      {
        rng: () => 0.9,
      },
    )

    expect(succeeded.combatantsById['target']?.states.map((marker) => marker.label)).toContain(
      'immune to Dreadful Glare',
    )
  })

  it('applies half damage on successful save to all enemy targets for area actions', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'dragon',
          label: 'Young Red Dragon',
          side: 'enemies',
          initiativeModifier: 5,
          dexterityScore: 10,
          armorClass: 18,
          actions: [
            {
              id: 'fire-breath',
              label: 'Fire Breath',
              kind: 'monster-action',
              cost: { action: true },
              resolutionMode: 'saving-throw',
              damage: '16',
              damageType: 'fire',
              saveProfile: {
                ability: 'dex',
                dc: 17,
                halfDamageOnSave: true,
              },
              targeting: {
                kind: 'all-enemies',
              },
            },
          ],
        }),
        createCombatant({
          instanceId: 'rogue',
          label: 'Rogue',
          side: 'party',
          initiativeModifier: 3,
          dexterityScore: 18,
          armorClass: 15,
          savingThrowModifiers: { dexterity: 8 },
        }),
        createCombatant({
          instanceId: 'fighter',
          label: 'Fighter',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 16,
          savingThrowModifiers: { dexterity: 1 },
        }),
      ],
      { rng: () => 0.9 },
    )

    const resolved = resolveCombatAction(
      state,
      {
        actorId: 'dragon',
        actionId: 'fire-breath',
      },
      {
        rng: () => 0.4, // d20 = 9, flat damage = 16
      },
    )

    expect(resolved.combatantsById['rogue']?.stats.currentHitPoints).toBe(4)
    expect(resolved.combatantsById['fighter']?.stats.currentHitPoints).toBe(0)
  })

  it('resolves movement-targeted save actions like Engulf with state rider notes', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'cube',
          label: 'Gelatinous Cube',
          side: 'enemies',
          initiativeModifier: 5,
          dexterityScore: 3,
          armorClass: 12,
          actions: [
            {
              id: 'engulf',
              label: 'Engulf',
              kind: 'monster-action',
              cost: { action: true },
              resolutionMode: 'saving-throw',
              saveProfile: {
                ability: 'dex',
                dc: 12,
                halfDamageOnSave: true,
              },
              targeting: { kind: 'entered-during-move' },
              movement: {
                upToSpeed: true,
                noOpportunityAttacks: true,
                canEnterCreatureSpaces: true,
                targetSizeMax: 'large',
              },
              onFailEffects: [
                { kind: 'damage', damage: '3d6', damageType: 'acid' },
                {
                  kind: 'state',
                  stateId: 'engulfed',
                  escape: {
                    dc: 12,
                    ability: 'str',
                    skill: 'athletics',
                    actionRequired: true,
                  },
                  ongoingEffects: [
                    { kind: 'condition', conditionId: 'restrained' },
                    { kind: 'damage', damage: '3d6', damageType: 'acid' },
                    { kind: 'note', text: 'Target is suffocating.' },
                    { kind: 'move', movesWithSource: true },
                  ],
                  notes: 'Target takes the acid damage at the start of the cube turns.',
                },
              ],
              onSuccessEffects: [
                { kind: 'damage', damage: '3d6', damageType: 'acid' },
                {
                  kind: 'move',
                  forced: true,
                  withinFeetOfSource: 5,
                  toNearestUnoccupiedSpace: true,
                  failIfNoSpace: true,
                },
              ],
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
          savingThrowModifiers: { dexterity: 1 },
          abilityScores: { strength: 14 },
        }),
      ],
      { rng: () => 0.9 },
    )

    const failed = resolveCombatAction(
      state,
      {
        actorId: 'cube',
        targetId: 'target',
        actionId: 'engulf',
      },
      {
        rng: () => 0.1,
      },
    )

    expect(failed.combatantsById['target']?.states.map((marker) => marker.label)).toContain('engulfed')
    expect(failed.log.some((entry) => entry.summary.includes('selected target as the creature crossed during movement'))).toBe(
      true,
    )
    expect(failed.log.some((entry) => entry.summary.includes('Escape DC 12 STR (athletics) as an action.'))).toBe(true)
    expect(failed.log.some((entry) => entry.summary.includes('Target is suffocating.'))).toBe(true)

    const succeeded = resolveCombatAction(
      state,
      {
        actorId: 'cube',
        targetId: 'target',
        actionId: 'engulf',
      },
      {
        rng: (() => {
          const rolls = [0.95, 0.1, 0.1, 0.1]
          let index = 0
          return () => rolls[index++] ?? 0.1
        })(),
      },
    )

    expect(succeeded.combatantsById['target']?.stats.currentHitPoints).toBe(9)
    expect(succeeded.log.some((entry) => entry.summary.includes('forced movement'))).toBe(true)
  })
})
