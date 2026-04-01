import { describe, expect, it } from 'vitest'

import { resolveCombatAction } from '../resolution'
import { createEncounterState } from '../state'

import { createCombatant } from './action-resolution.test-helpers'

describe('resolveCombatAction — spell effects, saves, and attack rolls', () => {
  it('resolves save-based spell effects via the effects resolution mode', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'caster',
          label: 'Cleric',
          side: 'party',
          initiativeModifier: 2,
          dexterityScore: 10,
          armorClass: 16,
          actions: [
            {
              id: 'sacred-flame',
              label: 'Sacred Flame',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'effects',
              effects: [
                {
                  kind: 'save',
                  save: { ability: 'dex', dc: 13 },
                  onFail: [{ kind: 'damage', damage: '8', damageType: 'radiant' }],
                },
              ],
              targeting: { kind: 'single-target' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 13,
          savingThrowModifiers: { dexterity: 2 },
        }),
      ],
      { rng: () => 0.1 },
    )

    const failed = resolveCombatAction(
      state,
      { actorId: 'caster', targetId: 'target', actionId: 'sacred-flame' },
      { rng: () => 0.2 },
    )

    expect(failed.combatantsById['target']?.stats.currentHitPoints).toBe(4)
    expect(failed.combatantsById['caster']?.turnResources?.actionAvailable).toBe(false)

    const succeeded = resolveCombatAction(
      state,
      { actorId: 'caster', targetId: 'target', actionId: 'sacred-flame' },
      { rng: () => 0.9 },
    )

    expect(succeeded.combatantsById['target']?.stats.currentHitPoints).toBe(12)
  })

  it('resolves area save spell effects against all enemies', () => {
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
              id: 'fireball',
              label: 'Fireball',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'effects',
              effects: [
                {
                  kind: 'save',
                  save: { ability: 'dex', dc: 15 },
                  onFail: [{ kind: 'damage', damage: '10', damageType: 'fire' }],
                  onSuccess: [{ kind: 'damage', damage: '5', damageType: 'fire' }],
                },
              ],
              targeting: { kind: 'all-enemies' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'goblin1',
          label: 'Goblin 1',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 13,
          savingThrowModifiers: { dexterity: 2 },
        }),
        createCombatant({
          instanceId: 'goblin2',
          label: 'Goblin 2',
          side: 'enemies',
          initiativeModifier: 0,
          dexterityScore: 14,
          armorClass: 13,
          savingThrowModifiers: { dexterity: 2 },
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolved = resolveCombatAction(
      state,
      { actorId: 'caster', actionId: 'fireball' },
      { rng: () => 0.2 },
    )

    expect(resolved.combatantsById['goblin1']?.stats.currentHitPoints).toBeLessThan(12)
    expect(resolved.combatantsById['goblin2']?.stats.currentHitPoints).toBeLessThan(12)
    expect(resolved.combatantsById['caster']?.turnResources?.actionAvailable).toBe(false)
    expect(resolved.log.some((entry) => entry.type === 'action-resolved')).toBe(true)
  })

  it('resolves save-based spell applying conditions on failed save', () => {
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
              id: 'hold-person',
              label: 'Hold Person',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'effects',
              effects: [
                {
                  kind: 'save',
                  save: { ability: 'wis', dc: 14 },
                  onFail: [{ kind: 'condition', conditionId: 'paralyzed' }],
                },
              ],
              targeting: { kind: 'single-target' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Bandit',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 12,
          armorClass: 12,
          abilityScores: { wisdom: 10 },
        }),
      ],
      { rng: () => 0.1 },
    )

    const resolved = resolveCombatAction(
      state,
      { actorId: 'caster', targetId: 'target', actionId: 'hold-person' },
      { rng: () => 0.2 },
    )

    expect(resolved.combatantsById['target']?.conditions.map((m) => m.label)).toContain('paralyzed')
    expect(resolved.combatantsById['caster']?.turnResources?.actionAvailable).toBe(false)
  })

  it('resolves attack-roll spells using the attack-roll path', () => {
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
              id: 'fire-bolt',
              label: 'Fire Bolt',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'attack-roll',
              attackProfile: {
                attackBonus: 5,
                damage: '10',
                damageType: 'fire',
              },
              targeting: { kind: 'single-target' },
            },
          ],
        }),
        createCombatant({
          instanceId: 'target',
          label: 'Goblin',
          side: 'enemies',
          initiativeModifier: 1,
          dexterityScore: 14,
          armorClass: 13,
        }),
      ],
      { rng: () => 0.1 },
    )

    const hit = resolveCombatAction(
      state,
      { actorId: 'caster', targetId: 'target', actionId: 'fire-bolt' },
      { rng: () => 0.7 },
    )

    expect(hit.combatantsById['target']?.stats.currentHitPoints).toBe(2)
    expect(hit.combatantsById['caster']?.turnResources?.actionAvailable).toBe(false)
    expect(hit.log.some((entry) => entry.type === 'attack-hit')).toBe(true)

    const miss = resolveCombatAction(
      state,
      { actorId: 'caster', targetId: 'target', actionId: 'fire-bolt' },
      { rng: () => 0.1 },
    )

    expect(miss.combatantsById['target']?.stats.currentHitPoints).toBe(12)
    expect(miss.log.some((entry) => entry.type === 'attack-missed')).toBe(true)
  })

  it('resolves multi-beam attack spells via sequence steps', () => {
    const state = createEncounterState(
      [
        createCombatant({
          instanceId: 'caster',
          label: 'Warlock',
          side: 'party',
          initiativeModifier: 3,
          dexterityScore: 10,
          armorClass: 12,
          actions: [
            {
              id: 'eldritch-blast',
              label: 'Eldritch Blast',
              kind: 'spell',
              cost: { action: true },
              resolutionMode: 'attack-roll',
              attackProfile: {
                attackBonus: 5,
                damage: '1',
                damageType: 'force',
              },
              targeting: { kind: 'single-target' },
              sequence: [{ actionLabel: 'Eldritch Blast Beam', count: 2 }],
            },
            {
              id: 'eldritch-blast-beam',
              label: 'Eldritch Blast Beam',
              kind: 'spell',
              cost: {},
              resolutionMode: 'attack-roll',
              attackProfile: {
                attackBonus: 5,
                damage: '1',
                damageType: 'force',
              },
              targeting: { kind: 'single-target' },
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

    const resolved = resolveCombatAction(
      state,
      { actorId: 'caster', targetId: 'target', actionId: 'eldritch-blast' },
      { rng: () => 0.7 },
    )

    expect(resolved.combatantsById['target']?.stats.currentHitPoints).toBe(10)
    expect(resolved.combatantsById['caster']?.turnResources?.actionAvailable).toBe(false)
    expect(resolved.log.filter((entry) => entry.type === 'attack-hit')).toHaveLength(2)
    expect(resolved.log[resolved.log.length - 1]?.summary).toBe('Eldritch Blast resolves its action sequence.')
  })
})
