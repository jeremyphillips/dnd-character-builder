import { describe, expect, it } from 'vitest'

import type { CombatLogEvent } from '@/features/mechanics/domain/combat'
import type { EncounterState } from '@/features/mechanics/domain/combat/state/types'

import { deriveEncounterToastsFromNewLogSlice } from '../derive-encounter-toast-for-viewer'

function turnEnded(id: string, round: number, turn: number, logId: string): CombatLogEvent {
  return {
    id: logId,
    timestamp: 't',
    type: 'turn-ended',
    actorId: id,
    round,
    turn,
    summary: 'x ends turn',
  }
}

function turnStarted(id: string, round: number, turn: number, logId: string): CombatLogEvent {
  return {
    id: logId,
    timestamp: 't',
    type: 'turn-started',
    actorId: id,
    round,
    turn,
    summary: 'y starts turn',
  }
}

/** Minimal encounter state for label + relationship (tests only). */
function testEncounter(activeId: string): EncounterState {
  return {
    combatantsById: {
      hero: {
        instanceId: 'hero',
        side: 'party',
        source: { kind: 'pc', sourceId: 'h1', label: 'Hero' },
      } as EncounterState['combatantsById'][string],
      goblin: {
        instanceId: 'goblin',
        side: 'enemies',
        source: { kind: 'monster', sourceId: 'g1', label: 'Goblin' },
      } as EncounterState['combatantsById'][string],
    },
    partyCombatantIds: ['hero'],
    enemyCombatantIds: ['goblin'],
    initiative: [],
    initiativeOrder: ['hero', 'goblin'],
    activeCombatantId: activeId,
    turnIndex: 0,
    roundNumber: 1,
    started: true,
    log: [],
  }
}

describe('deriveEncounterToastsFromNewLogSlice turn_changed', () => {
  it('suppresses for viewer who ended the turn (session player)', () => {
    const state = testEncounter('goblin')
    const slice = [turnEnded('hero', 1, 1, 'te1'), turnStarted('goblin', 1, 2, 'ts1')]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'session',
      controlledCombatantIds: ['hero'],
      tonePerspective: 'observer',
      viewerRole: 'player',
    })
    expect(list.filter((t) => t.dedupeKey.startsWith('turn-'))).toHaveLength(0)
  })

  it('success toast for new active controller', () => {
    const state = testEncounter('goblin')
    const slice = [turnEnded('hero', 1, 1, 'te1'), turnStarted('goblin', 1, 2, 'ts1')]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'session',
      controlledCombatantIds: ['goblin'],
      tonePerspective: 'self',
      viewerRole: 'player',
    })
    const turnToast = list.find((t) => t.dedupeKey.startsWith('turn-'))
    expect(turnToast).toBeDefined()
    expect(turnToast!.tone).toBe('success')
    expect(turnToast!.title).toContain('Your turn')
    expect(turnToast!.autoHideDuration).toBe(3000)
  })

  it('DM observer gets info toast', () => {
    const state = testEncounter('goblin')
    const slice = [turnEnded('hero', 1, 1, 'te1'), turnStarted('goblin', 1, 2, 'ts1')]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'session',
      controlledCombatantIds: [],
      tonePerspective: 'dm',
      viewerRole: 'dm',
    })
    const turnToast = list.find((t) => t.dedupeKey.startsWith('turn-'))
    expect(turnToast?.tone).toBe('info')
    expect(turnToast?.title).toBe("Goblin's turn")
    expect(turnToast?.autoHideDuration).toBe(2000)
  })

  it('participant player (not active) gets info toast', () => {
    const state = testEncounter('goblin')
    const slice = [turnEnded('hero', 1, 1, 'te1'), turnStarted('goblin', 1, 2, 'ts1')]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'session',
      controlledCombatantIds: ['ally'],
      tonePerspective: 'observer',
      viewerRole: 'player',
    })
    const turnToast = list.find((t) => t.dedupeKey.startsWith('turn-'))
    expect(turnToast?.tone).toBe('info')
  })

  it('suppresses session observer seat', () => {
    const state = testEncounter('goblin')
    const slice = [turnEnded('hero', 1, 1, 'te1'), turnStarted('goblin', 1, 2, 'ts1')]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'session',
      controlledCombatantIds: [],
      tonePerspective: 'observer',
      viewerRole: 'observer',
    })
    expect(list.filter((t) => t.dedupeKey.startsWith('turn-'))).toHaveLength(0)
  })

  it('simulator: POV matches next active → success', () => {
    const state = testEncounter('goblin')
    const slice = [turnEnded('hero', 1, 1, 'te1'), turnStarted('goblin', 1, 2, 'ts1')]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'simulator',
      controlledCombatantIds: [],
      tonePerspective: 'dm',
      simulatorPresentationCombatantId: 'goblin',
    })
    const turnToast = list.find((t) => t.dedupeKey.startsWith('turn-'))
    expect(turnToast?.tone).toBe('success')
  })

  it('simulator: POV matches ended active → suppress', () => {
    const state = testEncounter('goblin')
    const slice = [turnEnded('hero', 1, 1, 'te1'), turnStarted('goblin', 1, 2, 'ts1')]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'simulator',
      controlledCombatantIds: [],
      tonePerspective: 'dm',
      simulatorPresentationCombatantId: 'hero',
    })
    expect(list.filter((t) => t.dedupeKey.startsWith('turn-'))).toHaveLength(0)
  })

  it('uses first turn-ended and last turn-started when multiple pairs in one slice', () => {
    const state = testEncounter('goblin')
    const slice = [
      turnEnded('hero', 1, 1, 'te1'),
      turnStarted('hero', 1, 1, 'tsA'),
      turnEnded('hero', 1, 1, 'te2'),
      turnStarted('goblin', 1, 2, 'tsB'),
    ]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'session',
      controlledCombatantIds: ['hero'],
      tonePerspective: 'observer',
      viewerRole: 'player',
    })
    expect(list.filter((t) => t.dedupeKey.startsWith('turn-'))).toHaveLength(0)
  })

  it('orders action_resolved before turn_changed when both present', () => {
    const state = testEncounter('goblin')
    const slice = [
      {
        id: 'hit1',
        timestamp: 't',
        type: 'attack-hit',
        actorId: 'hero',
        targetIds: ['goblin'],
        round: 1,
        turn: 1,
        summary: 'Hit',
      } as CombatLogEvent,
      turnEnded('hero', 1, 1, 'te1'),
      turnStarted('goblin', 1, 2, 'ts1'),
    ]
    const list = deriveEncounterToastsFromNewLogSlice(slice, state, {
      viewerMode: 'session',
      controlledCombatantIds: ['goblin'],
      tonePerspective: 'self',
      viewerRole: 'player',
    })
    expect(list.length).toBeGreaterThanOrEqual(2)
    expect(list[0].dedupeKey).toMatch(/^r1-t1-/)
    expect(list[1].dedupeKey.startsWith('turn-')).toBe(true)
  })
})
