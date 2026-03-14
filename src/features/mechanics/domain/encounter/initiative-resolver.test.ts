import { describe, expect, it } from 'vitest'

import { createEncounterState } from './encounter-state'
import { rollInitiative } from './initiative-resolver'
import type { CombatantInstance } from './combatant.types'

describe('rollInitiative', () => {
  it('sorts by total, then modifier, then dexterity, then name', () => {
    const rolls = rollInitiative(
      [
        { instanceId: 'goblin-2', label: 'Goblin B', initiativeModifier: 2, dexterityScore: 14 },
        { instanceId: 'goblin-1', label: 'Goblin A', initiativeModifier: 2, dexterityScore: 14 },
        { instanceId: 'rogue', label: 'Rogue', initiativeModifier: 4, dexterityScore: 18 },
      ],
      {
        rng: () => 0.45, // 10 on a d20
      },
    )

    expect(rolls.map((roll) => roll.combatantId)).toEqual(['rogue', 'goblin-1', 'goblin-2'])
    expect(rolls.map((roll) => roll.total)).toEqual([14, 12, 12])
  })

  it('creates encounter state with the first initiative result active', () => {
    const combatants: CombatantInstance[] = [
      {
        instanceId: 'pc-1',
        side: 'party',
        source: { kind: 'pc', sourceId: 'pc-1', label: 'Cleric' },
        stats: { armorClass: 18, maxHitPoints: 20, currentHitPoints: 20, initiativeModifier: 0, dexterityScore: 10 },
        attacks: [],
        activeEffects: [],
      },
      {
        instanceId: 'monster-1',
        side: 'enemies',
        source: { kind: 'monster', sourceId: 'goblin', label: 'Goblin' },
        stats: { armorClass: 15, maxHitPoints: 7, currentHitPoints: 7, initiativeModifier: 2, dexterityScore: 14 },
        attacks: [],
        activeEffects: [],
      },
    ]

    const state = createEncounterState(combatants, {
      rng: () => 0.45,
    })

    expect(state.initiativeOrder).toEqual(['monster-1', 'pc-1'])
    expect(state.activeCombatantId).toBe('monster-1')
    expect(state.roundNumber).toBe(1)
    expect(state.partyCombatantIds).toEqual(['pc-1'])
    expect(state.enemyCombatantIds).toEqual(['monster-1'])
  })
})
