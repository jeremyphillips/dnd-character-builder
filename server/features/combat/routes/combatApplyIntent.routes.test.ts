// @vitest-environment node
import type { AddressInfo } from 'node:net'
import express from 'express'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { CombatantInstance } from '@rpg-world-builder/mechanics'

import {
  createInMemoryCombatSessionBackend,
  setCombatSessionBackendForTests,
} from '../persistence/combatSession.backend'
import combatRoutes from './combat.routes'

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

describe('POST /api/combat/sessions/:sessionId/intents', () => {
  const app = express()
  app.use(express.json())
  app.use('/api/combat', combatRoutes)

  let baseUrl: string
  let server: ReturnType<typeof app.listen>

  beforeAll(() => {
    setCombatSessionBackendForTests(createInMemoryCombatSessionBackend())
    return new Promise<void>((resolve, reject) => {
      server = app.listen(0, () => {
        try {
          const addr = server.address() as AddressInfo
          baseUrl = `http://127.0.0.1:${addr.port}`
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })
  })

  afterAll(
    () =>
      new Promise<void>((resolve, reject) => {
        setCombatSessionBackendForTests(null)
        server.close((err) => (err ? reject(err) : resolve()))
      }),
  )

  async function createSession() {
    const res = await fetch(`${baseUrl}/api/combat/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        combatants: [minimalCombatant('m', 'enemies', 20, 2), minimalCombatant('p', 'party', 20, 0)],
      }),
    })
    expect(res.status).toBe(200)
    return (await res.json()) as { sessionId: string; revision: number }
  }

  it('returns 400 for invalid body', async () => {
    const created = await createSession()
    const res = await fetch(`${baseUrl}/api/combat/sessions/${created.sessionId}/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const json = (await res.json()) as { ok: boolean; error?: { code: string } }
    expect(json.ok).toBe(false)
    expect(json.error?.code).toBe('invalid-body')
  })

  it('returns 200 with updated revision and state on successful end-turn', async () => {
    const created = await createSession()
    const res = await fetch(`${baseUrl}/api/combat/sessions/${created.sessionId}/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseRevision: 1,
        intent: { kind: 'end-turn' },
        context: { advanceEncounterTurnOptions: {} },
      }),
    })
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      ok: boolean
      revision?: number
      result?: { ok: boolean }
      state?: { roundNumber: number }
    }
    expect(json.ok).toBe(true)
    expect(json.revision).toBe(2)
    expect(json.result?.ok).toBe(true)
    expect(json.state?.roundNumber).toBeDefined()
  })

  it('returns 409 for stale baseRevision', async () => {
    const created = await createSession()
    const first = await fetch(`${baseUrl}/api/combat/sessions/${created.sessionId}/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseRevision: 1,
        intent: { kind: 'end-turn' },
        context: { advanceEncounterTurnOptions: {} },
      }),
    })
    expect(first.status).toBe(200)

    const stale = await fetch(`${baseUrl}/api/combat/sessions/${created.sessionId}/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseRevision: 1,
        intent: { kind: 'end-turn' },
        context: { advanceEncounterTurnOptions: {} },
      }),
    })
    expect(stale.status).toBe(409)
    const json = (await stale.json()) as {
      ok: boolean
      error?: { code: string; currentRevision?: number }
    }
    expect(json.ok).toBe(false)
    expect(json.error?.code).toBe('stale-revision')
    expect(json.error?.currentRevision).toBe(2)
  })

  it('returns 404 for unknown session', async () => {
    const res = await fetch(
      `${baseUrl}/api/combat/sessions/00000000-0000-0000-0000-000000000000/intents`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseRevision: 1,
          intent: { kind: 'end-turn' },
        }),
      },
    )
    expect(res.status).toBe(404)
  })

  it('returns 200 with mechanics failure without bumping revision', async () => {
    const created = await createSession()
    const res = await fetch(`${baseUrl}/api/combat/sessions/${created.sessionId}/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseRevision: 1,
        intent: { kind: 'end-turn', actorId: 'not-active' },
      }),
    })
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      ok: boolean
      revision?: number
      result?: { ok: boolean; error?: { code: string } }
    }
    expect(json.ok).toBe(true)
    expect(json.revision).toBe(1)
    expect(json.result?.ok).toBe(false)
    expect(json.result?.error?.code).toBe('actor-mismatch')
  })
})
