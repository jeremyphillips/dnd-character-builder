import { describe, expect, it } from 'vitest'

import { resolveCombatAction } from '../resolution'
import { advanceEncounterTurn, createEncounterState } from '../state'

import { createCombatant } from './action-resolution.test-helpers'

describe('resolveCombatAction — spell modifiers, immunity, and targeting edge cases', () => {
  it('self-targeting effects mode applies modifier to caster AC', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'caster',
          label: 'Wizard',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 10,
          armorClass: 12,
          actions: [
            {
              id: 'shield-spell',
              label: 'Shield',
              kind: 'spell',
              cost: { reaction: true },
              resolutionMode: 'effects',
              effects: [
                {
                  kind: 'modifier',
                  target: 'armor_class',
                  mode: 'add',
                  value: 5,
                  duration: {
                    kind: 'until-turn-boundary',
                    subject: 'self' as const,
                    turn: 'next' as const,
                    boundary: 'start' as const,
                  },
                },
              ],
              targeting: { kind: 'self' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'enemy',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 13,
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolved = resolveCombatAction(
      state,
      { actorId: 'caster', actionId: 'shield-spell' },
      { rng: () => 0.5 },
    )

    expect(resolved.combatantsById['caster']?.stats.armorClass).toBe(17)
    expect(resolved.combatantsById['caster']?.statModifiers).toHaveLength(1)
    expect(resolved.combatantsById['caster']?.statModifiers?.[0]?.value).toBe(5)
    expect(resolved.combatantsById['caster']?.turnResources?.reactionAvailable).toBe(false)
  })

  it('effects mode skips AC modifier when spell condition is not met (unarmored gate)', () => {
    const mageArmorEffects = [
      {
        kind: 'modifier' as const,
        target: 'armor_class' as const,
        mode: 'set' as const,
        value: 13,
        condition: {
          kind: 'state' as const,
          target: 'self' as const,
          property: 'equipment.armorEquipped',
          equals: null,
        },
      },
    ]

    const stateArmored = createEncounterState(
      [
        createCombatant({
          instanceId: 'caster',
          label: 'Wizard',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 10,
          armorClass: 12,
          actions: [
            {
              id: 'mage-armor',
              label: 'Mage Armor',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'effects',
              effects: [...mageArmorEffects],
              targeting: { kind: 'single-creature' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'ally',
          label: 'Ally',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 12,
          equipment: { armorEquipped: 'leather' },
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolvedArmored = resolveCombatAction(
      stateArmored,
      { actorId: 'caster', targetId: 'ally', actionId: 'mage-armor' },
      { rng: () => 0.5 },
    )

    expect(resolvedArmored.combatantsById['ally']?.stats.armorClass).toBe(12)
    expect(resolvedArmored.combatantsById['ally']?.statModifiers ?? []).toHaveLength(0)
    expect(resolvedArmored.log.some((e) => e.summary.includes('Modifier not applied'))).toBe(true)

    const stateUnarmored = createEncounterState(
      [
        createCombatant({
          instanceId: 'caster',
          label: 'Wizard',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 10,
          armorClass: 12,
          actions: [
            {
              id: 'mage-armor',
              label: 'Mage Armor',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'effects',
              effects: [...mageArmorEffects],
              targeting: { kind: 'single-creature' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'ally',
          label: 'Ally',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 12,
          equipment: { armorEquipped: null },
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolvedUnarmored = resolveCombatAction(
      stateUnarmored,
      { actorId: 'caster', targetId: 'ally', actionId: 'mage-armor' },
      { rng: () => 0.5 },
    )

    expect(resolvedUnarmored.combatantsById['ally']?.stats.armorClass).toBe(13)
    expect(resolvedUnarmored.combatantsById['ally']?.statModifiers).toHaveLength(1)
  })

  it('self-targeting effects mode applies spell immunity as state marker', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'caster',
          label: 'Wizard',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 10,
          armorClass: 12,
          actions: [
            {
              id: 'shield-spell',
              label: 'Shield',
              kind: 'spell',
              cost: { reaction: true },
              resolutionMode: 'effects',
              effects: [
                {
                  kind: 'immunity',
                  scope: 'spell',
                  spellIds: ['magic-missile'],
                  duration: {
                    kind: 'until-turn-boundary',
                    subject: 'self' as const,
                    turn: 'next' as const,
                    boundary: 'start' as const,
                  },
                  notes: 'You take no damage from Magic Missile.',
                },
              ],
              targeting: { kind: 'self' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'enemy',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 13,
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolved = resolveCombatAction(
      state,
      { actorId: 'caster', actionId: 'shield-spell' },
      { rng: () => 0.5 },
    )

    expect(resolved.combatantsById['caster']?.states.some((s) => s.label.includes('magic-missile'))).toBe(true)
  })

  it('stat modifier marker expires and reverts AC at turn boundary', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'caster',
          label: 'Wizard',
          side: 'party',
          initiativeModifier: 5,
          dexterityScore: 10,
          armorClass: 12,
          actions: [
            {
              id: 'shield-spell',
              label: 'Shield',
              kind: 'spell',
              cost: { reaction: true },
              resolutionMode: 'effects',
              effects: [
                {
                  kind: 'modifier',
                  target: 'armor_class',
                  mode: 'add',
                  value: 5,
                  duration: {
                    kind: 'until-turn-boundary',
                    subject: 'self' as const,
                    turn: 'next' as const,
                    boundary: 'start' as const,
                  },
                },
              ],
              targeting: { kind: 'self' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'enemy',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 13,
        }),
      ],
      { rng: () => 0.1 },
    )

    const withShield = resolveCombatAction(
      state,
      { actorId: 'caster', actionId: 'shield-spell' },
      { rng: () => 0.5 },
    )

    expect(withShield.combatantsById['caster']?.stats.armorClass).toBe(17)

    const initiativeRng = () => 0.1
    const afterEnemyTurn = advanceEncounterTurn(withShield, { rng: initiativeRng })
    expect(afterEnemyTurn.combatantsById['caster']?.stats.armorClass).toBe(17)

    const afterCasterTurnStart = advanceEncounterTurn(afterEnemyTurn, { rng: initiativeRng })
    expect(afterCasterTurnStart.combatantsById['caster']?.stats.armorClass).toBe(12)
    expect(afterCasterTurnStart.combatantsById['caster']?.statModifiers).toHaveLength(0)
    expect(afterCasterTurnStart.log.some((entry) => entry.summary.includes('stat modifier expires'))).toBe(true)
  })

  it('effects resolution logs "no valid targets" when no enemies remain', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'caster',
          label: 'Wizard',
          side: 'party',
          initiativeModifier: 3,
          dexterityScore: 10,
          armorClass: 12,
          actions: [
            {
              id: 'spell',
              label: 'Test Spell',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'effects',
              effects: [
                {
                  kind: 'save',
                  save: { ability: 'dex', dc: 13 },
                  onFail: [{ kind: 'damage', damage: '8', damageType: 'fire' }],
                },
              ],
              targeting: { kind: 'single-target' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'ally',
          label: 'Fighter',
          side: 'party',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 16,
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolved = resolveCombatAction(
      state,
      { actorId: 'caster', actionId: 'spell' },
      { rng: () => 0.5 },
    )

    expect(resolved.log.some((entry) => entry.summary.includes('no valid targets'))).toBe(true)
  })
})
