import { describe, expect, it } from 'vitest'

import type { CombatantInstance } from '../state'
import { createEncounterState } from '../state'
import { applyCombatIntent } from './apply-combat-intent'

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

describe('applyCombatIntent', () => {
  it('fails with no-encounter-state when state is null', () => {
    const result = applyCombatIntent(null, { kind: 'end-turn' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('no-encounter-state')
  })

  it('applies end-turn and returns success with next state and events', () => {
    const combatants: CombatantInstance[] = [
      baseCombatant('monster-1', 'enemies', 0, 2),
      baseCombatant('pc-1', 'party', 20, 0),
    ]
    const started = createEncounterState(combatants, { rng: () => 0.45 })
    expect(started.activeCombatantId).toBe('pc-1')

    const result = applyCombatIntent(started, { kind: 'end-turn' }, { advanceEncounterTurnOptions: { rng: () => 0.45 } })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.nextState.roundNumber).toBe(2)
    expect(result.events.some((e) => e.kind === 'turn-ended')).toBe(true)
    const logEvents = result.events.filter((e): e is Extract<typeof e, { kind: 'log-appended' }> => e.kind === 'log-appended')
    expect(logEvents.length).toBeGreaterThanOrEqual(0)
  })

  it('rejects end-turn when actorId does not match active combatant', () => {
    const combatants: CombatantInstance[] = [
      baseCombatant('monster-1', 'enemies', 20, 2),
      baseCombatant('pc-1', 'party', 20, 0),
    ]
    const started = createEncounterState(combatants, { rng: () => 0.5 })
    const result = applyCombatIntent(started, { kind: 'end-turn', actorId: 'wrong-id' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('actor-mismatch')
  })

  it('returns not-implemented for move-combatant', () => {
    const combatants: CombatantInstance[] = [baseCombatant('pc-1', 'party', 20, 0)]
    const started = createEncounterState(combatants, { rng: () => 0.5 })
    const result = applyCombatIntent(started, {
      kind: 'move-combatant',
      combatantId: 'pc-1',
      destinationCellId: 'c1',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('not-implemented')
      if (result.error.code === 'not-implemented') expect(result.error.intentKind).toBe('move-combatant')
    }
  })
})
