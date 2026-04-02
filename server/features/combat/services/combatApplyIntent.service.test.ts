// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
  applyCombatIntentRequest,
  parsePersistedApplyIntentBody,
} from './combatApplyIntent.service'

describe('parsePersistedApplyIntentBody', () => {
  it('rejects non-object body', () => {
    expect(parsePersistedApplyIntentBody(null).ok).toBe(false)
    expect(parsePersistedApplyIntentBody([]).ok).toBe(false)
  })

  it('rejects missing baseRevision', () => {
    const p = parsePersistedApplyIntentBody({ intent: { kind: 'end-turn' } })
    expect(p.ok).toBe(false)
  })

  it('rejects non-integer baseRevision', () => {
    const p = parsePersistedApplyIntentBody({ baseRevision: 1.5, intent: { kind: 'end-turn' } })
    expect(p.ok).toBe(false)
  })

  it('parses minimal persisted body', () => {
    const p = parsePersistedApplyIntentBody({
      baseRevision: 1,
      intent: { kind: 'end-turn' },
    })
    expect(p.ok).toBe(true)
    if (!p.ok) return
    expect(p.baseRevision).toBe(1)
  })
})

describe('applyCombatIntentRequest', () => {
  it('returns no-encounter-state when state is null', () => {
    const result = applyCombatIntentRequest(null, { kind: 'end-turn' }, {})
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('no-encounter-state')
  })
})
