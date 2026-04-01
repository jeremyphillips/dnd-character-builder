import { describe, expect, it } from 'vitest'

import { flattenLogEntriesFromEvents, flattenLogEntriesFromIntentSuccess } from './intent-success-log-entries'
import type { CombatEvent, CombatIntentSuccess } from '../results'
import type { CombatLogEvent } from '../state/types'

function mkEntry(id: string): CombatLogEvent {
  return {
    id,
    timestamp: 't',
    type: 'note',
    round: 1,
    turn: 1,
    summary: 's',
  }
}

describe('flattenLogEntriesFromEvents', () => {
  it('returns empty when there are no log-appended events', () => {
    const events: CombatEvent[] = [
      { kind: 'turn-ended', previousActiveCombatantId: 'a', nextActiveCombatantId: 'b' },
    ]
    expect(flattenLogEntriesFromEvents(events)).toEqual([])
  })

  it('returns empty when log-appended has empty entries', () => {
    const events: CombatEvent[] = [{ kind: 'log-appended', entries: [] }]
    expect(flattenLogEntriesFromEvents(events)).toEqual([])
  })

  it('flattens a single log-appended chunk', () => {
    const a = mkEntry('1')
    const b = mkEntry('2')
    const events: CombatEvent[] = [{ kind: 'log-appended', entries: [a, b] }]
    expect(flattenLogEntriesFromEvents(events)).toEqual([a, b])
  })

  it('concatenates multiple log-appended chunks in event order', () => {
    const first = mkEntry('a')
    const second = mkEntry('b')
    const third = mkEntry('c')
    const events: CombatEvent[] = [
      { kind: 'turn-ended', previousActiveCombatantId: null, nextActiveCombatantId: 'x' },
      { kind: 'log-appended', entries: [first] },
      { kind: 'action-resolved', actorId: '1', actionId: 'atk' },
      { kind: 'log-appended', entries: [second, third] },
    ]
    expect(flattenLogEntriesFromEvents(events)).toEqual([first, second, third])
  })
})

describe('flattenLogEntriesFromIntentSuccess', () => {
  it('delegates to events on the success result', () => {
    const e1 = mkEntry('x')
    const success: CombatIntentSuccess = {
      ok: true,
      nextState: {} as CombatIntentSuccess['nextState'],
      events: [{ kind: 'log-appended', entries: [e1] }],
    }
    expect(flattenLogEntriesFromIntentSuccess(success)).toEqual([e1])
  })
})
