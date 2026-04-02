import { describe, expect, it } from 'vitest'

import type { CombatantInstance } from '../state'
import {
  advanceEncounterTurn,
  createEncounterState,
  removeCombatantFromInitiativeOrder,
} from '../state'

function baseCombatant(
  id: string,
  side: CombatantInstance['side'],
  hp: number,
  initMod: number,
): CombatantInstance {
  return {
    instanceId: id,
    side,
    source: { kind: side === 'party' ? 'pc' : 'monster', sourceId: id, label: id },
    stats: {
      armorClass: 10,
      maxHitPoints: 20,
      currentHitPoints: hp,
      initiativeModifier: initMod,
      dexterityScore: 10,
    },
    attacks: [],
    activeEffects: [],
    runtimeEffects: [],
    turnHooks: [],
    conditions: [],
    states: [],
  }
}

describe('removeCombatantFromInitiativeOrder', () => {
  it('removes id and preserves active when active is not removed', () => {
    const state = {
      combatantsById: {} as Record<string, CombatantInstance>,
      partyCombatantIds: [],
      enemyCombatantIds: [],
      initiative: [
        { combatantId: 'a', label: 'A', roll: 10, modifier: 0, total: 10, dexterityScore: 10 },
        { combatantId: 'b', label: 'B', roll: 10, modifier: 0, total: 10, dexterityScore: 10 },
        { combatantId: 'c', label: 'C', roll: 10, modifier: 0, total: 10, dexterityScore: 10 },
      ],
      initiativeOrder: ['a', 'b', 'c'],
      activeCombatantId: 'b',
      turnIndex: 1,
      roundNumber: 1,
      started: true,
      log: [],
    }
    const next = removeCombatantFromInitiativeOrder(state, 'c')
    expect(next.initiativeOrder).toEqual(['a', 'b'])
    expect(next.activeCombatantId).toBe('b')
    expect(next.turnIndex).toBe(1)
  })

  it('hands turn to next when removing active combatant', () => {
    const state = {
      combatantsById: {} as Record<string, CombatantInstance>,
      partyCombatantIds: [],
      enemyCombatantIds: [],
      initiative: [
        { combatantId: 'a', label: 'A', roll: 10, modifier: 0, total: 10, dexterityScore: 10 },
        { combatantId: 'b', label: 'B', roll: 10, modifier: 0, total: 10, dexterityScore: 10 },
      ],
      initiativeOrder: ['a', 'b'],
      activeCombatantId: 'a',
      turnIndex: 0,
      roundNumber: 1,
      started: true,
      log: [],
    }
    const next = removeCombatantFromInitiativeOrder(state, 'a')
    expect(next.initiativeOrder).toEqual(['b'])
    expect(next.activeCombatantId).toBe('b')
    expect(next.turnIndex).toBe(0)
  })
})

describe('auto-skip non-interactive turns', () => {
  it('skips defeated first combatant so active becomes next in initiative', () => {
    const combatants: CombatantInstance[] = [
      baseCombatant('monster-1', 'enemies', 0, 2),
      baseCombatant('pc-1', 'party', 20, 0),
    ]

    const state = createEncounterState(combatants, {
      rng: () => 0.45,
    })

    expect(state.initiativeOrder[0]).toBe('monster-1')
    expect(state.activeCombatantId).toBe('pc-1')
    expect(state.log.map((e) => e.type)).toEqual([
      'encounter-started',
      'turn-started',
      'turn-ended',
      'turn-started',
    ])
  })

  it('advanceEncounterTurn ends living turn and wraps round with alive-only re-roll', () => {
    const combatants: CombatantInstance[] = [
      baseCombatant('monster-1', 'enemies', 0, 2),
      baseCombatant('pc-1', 'party', 20, 0),
    ]

    const started = createEncounterState(combatants, { rng: () => 0.45 })
    expect(started.activeCombatantId).toBe('pc-1')

    const afterPcTurn = advanceEncounterTurn(started, { rng: () => 0.45 })
    expect(afterPcTurn.roundNumber).toBe(2)
    expect(afterPcTurn.activeCombatantId).toBe('pc-1')
  })
})
