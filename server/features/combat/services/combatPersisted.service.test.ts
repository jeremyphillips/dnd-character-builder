// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { CombatantInstance } from '@rpg-world-builder/mechanics'

import {
  createInMemoryCombatSessionBackend,
  setCombatSessionBackendForTests,
} from '../persistence/combatSession.backend'
import {
  applyPersistedIntent,
  createPersistedCombatSession,
} from './combatPersisted.service'

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

describe('combatPersisted.service', () => {
  beforeAll(() => {
    setCombatSessionBackendForTests(createInMemoryCombatSessionBackend())
  })
  afterAll(() => {
    setCombatSessionBackendForTests(null)
  })

  it('creates a persisted session with revision 1', async () => {
    const created = await createPersistedCombatSession({
      combatants: [minimalCombatant('a', 'party', 20, 0), minimalCombatant('b', 'enemies', 20, 1)],
    })
    expect(created.ok).toBe(true)
    if (!created.ok) return
    expect(created.revision).toBe(1)
    expect(created.sessionId).toBeDefined()
    expect(created.state.started).toBe(true)
  })

  it('applies intent and increments revision on success', async () => {
    const created = await createPersistedCombatSession({
      combatants: [minimalCombatant('m', 'enemies', 20, 2), minimalCombatant('p', 'party', 20, 0)],
    })
    expect(created.ok).toBe(true)
    if (!created.ok) return

    const applied = await applyPersistedIntent(
      created.sessionId,
      1,
      { kind: 'end-turn' },
      { advanceEncounterTurnOptions: { rng: () => 0.45 } },
    )
    expect(applied.kind).toBe('success')
    if (applied.kind !== 'success') return
    expect(applied.revision).toBe(2)
    expect(applied.result.ok).toBe(true)
  })

  it('rejects stale baseRevision', async () => {
    const created = await createPersistedCombatSession({
      combatants: [minimalCombatant('m', 'enemies', 20, 2), minimalCombatant('p', 'party', 20, 0)],
    })
    expect(created.ok).toBe(true)
    if (!created.ok) return

    const stale = await applyPersistedIntent(created.sessionId, 0, { kind: 'end-turn' }, {})
    expect(stale.kind).toBe('stale')
    if (stale.kind !== 'stale') return
    expect(stale.currentRevision).toBe(1)
  })

  it('returns not-found for unknown session', async () => {
    const r = await applyPersistedIntent('00000000-0000-0000-0000-000000000000', 1, { kind: 'end-turn' }, {})
    expect(r.kind).toBe('not-found')
  })
})
