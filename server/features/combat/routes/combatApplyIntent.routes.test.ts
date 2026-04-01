// @vitest-environment node
import type { AddressInfo } from 'node:net'
import express from 'express'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { CombatantInstance } from '@rpg-world-builder/mechanics'

import combatRoutes from './combat.routes'
import { startCombatSession } from '../services/combatSessions.service'

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

describe('POST /api/combat/sessions/apply-intent', () => {
  const app = express()
  app.use(express.json())
  app.use('/api/combat', combatRoutes)

  let baseUrl: string
  let server: ReturnType<typeof app.listen>

  beforeAll(
    () =>
      new Promise<void>((resolve, reject) => {
        server = app.listen(0, () => {
          try {
            const addr = server.address() as AddressInfo
            baseUrl = `http://127.0.0.1:${addr.port}`
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      }),
  )

  afterAll(
    () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()))
      }),
  )

  it('returns 400 for invalid body', async () => {
    const res = await fetch(`${baseUrl}/api/combat/sessions/apply-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const json = (await res.json()) as { ok: boolean; error?: { code: string } }
    expect(json.ok).toBe(false)
    expect(json.error?.code).toBe('invalid-body')
  })

  it('returns 200 with canonical result for end-turn', async () => {
    const started = startCombatSession({
      combatants: [minimalCombatant('m', 'enemies', 20, 2), minimalCombatant('p', 'party', 20, 0)],
    })
    expect(started.ok).toBe(true)
    if (!started.ok) return

    const res = await fetch(`${baseUrl}/api/combat/sessions/apply-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: started.state,
        intent: { kind: 'end-turn' },
        context: { advanceEncounterTurnOptions: {} },
      }),
    })
    expect(res.status).toBe(200)
    const json = (await res.json()) as {
      result: { ok: boolean; nextState?: { roundNumber: number } }
    }
    expect(json.result.ok).toBe(true)
    if (!json.result.ok) return
    expect(json.result.nextState?.roundNumber).toBeDefined()
  })

  it('returns 200 with mechanics failure in result for actor mismatch', async () => {
    const started = startCombatSession({
      combatants: [minimalCombatant('m', 'enemies', 20, 2), minimalCombatant('p', 'party', 20, 0)],
    })
    expect(started.ok).toBe(true)
    if (!started.ok) return

    const res = await fetch(`${baseUrl}/api/combat/sessions/apply-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: started.state,
        intent: { kind: 'end-turn', actorId: 'not-active' },
      }),
    })
    expect(res.status).toBe(200)
    const json = (await res.json()) as { result: { ok: boolean; error?: { code: string } } }
    expect(json.result.ok).toBe(false)
    if (json.result.ok) return
    expect(json.result.error?.code).toBe('actor-mismatch')
  })
})
