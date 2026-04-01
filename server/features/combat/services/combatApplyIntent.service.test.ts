// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { CombatantInstance } from '@rpg-world-builder/mechanics'

import {
  applyCombatIntentRequest,
  parseApplyIntentBody,
} from './combatApplyIntent.service'
import { startCombatSession } from './combatSessions.service'

function minimalCombatant(
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
    actions: [],
    activeEffects: [],
    runtimeEffects: [],
    turnHooks: [],
    conditions: [],
    states: [],
  }
}

describe('parseApplyIntentBody', () => {
  it('rejects non-object body', () => {
    expect(parseApplyIntentBody(null).ok).toBe(false)
    expect(parseApplyIntentBody([]).ok).toBe(false)
  })

  it('rejects missing intent', () => {
    const p = parseApplyIntentBody({ state: {} })
    expect(p.ok).toBe(false)
    if (p.ok) return
    expect(p.error.code).toBe('invalid-body')
  })

  it('rejects intent without kind', () => {
    const p = parseApplyIntentBody({ intent: {} })
    expect(p.ok).toBe(false)
  })

  it('rejects non-object state', () => {
    const p = parseApplyIntentBody({ intent: { kind: 'end-turn' }, state: [] })
    expect(p.ok).toBe(false)
  })

  it('rejects non-object context', () => {
    const p = parseApplyIntentBody({
      intent: { kind: 'end-turn' },
      state: {},
      context: [],
    })
    expect(p.ok).toBe(false)
  })

  it('parses intent with null state', () => {
    const p = parseApplyIntentBody({ intent: { kind: 'end-turn' }, state: null })
    expect(p.ok).toBe(true)
    if (!p.ok) return
    expect(p.state).toBeNull()
  })

  it('parses intent with omitted state as null', () => {
    const p = parseApplyIntentBody({ intent: { kind: 'end-turn' } })
    expect(p.ok).toBe(true)
    if (!p.ok) return
    expect(p.state).toBeNull()
  })
})

describe('applyCombatIntentRequest', () => {
  it('returns no-encounter-state when state is null', () => {
    const result = applyCombatIntentRequest(null, { kind: 'end-turn' }, {})
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('no-encounter-state')
  })

  it('applies end-turn on started encounter', () => {
    const started = startCombatSession({
      combatants: [minimalCombatant('m', 'enemies', 20, 2), minimalCombatant('p', 'party', 20, 0)],
    })
    expect(started.ok).toBe(true)
    if (!started.ok) return

    const result = applyCombatIntentRequest(
      started.state,
      { kind: 'end-turn' },
      { advanceEncounterTurnOptions: { rng: () => 0.45 } },
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.nextState.roundNumber).toBeGreaterThanOrEqual(1)
    expect(result.events.some((e) => e.kind === 'turn-ended')).toBe(true)
  })
})
