import { describe, expect, it } from 'vitest'

import type { CombatantInstance } from '@/features/mechanics/domain/combat/state'
import type { EncounterState } from '@/features/mechanics/domain/combat'

import {
  deriveEncounterCapabilities,
  type EncounterViewerContext,
} from '../encounter-capabilities.types'
import { resolveSessionControlledCombatantIds } from '../resolve-session-controlled-combatant-ids'

function minimalCombatant(
  instanceId: string,
  source: CombatantInstance['source'],
  side: CombatantInstance['side'],
): CombatantInstance {
  return {
    instanceId,
    side,
    source,
    stats: {
      armorClass: 10,
      maxHitPoints: 10,
      currentHitPoints: 10,
      initiativeModifier: 0,
      dexterityScore: 10,
    },
    attacks: [],
    activeEffects: [],
    runtimeEffects: [],
    turnHooks: [],
    conditions: [],
    states: [],
  } as CombatantInstance
}

function stubEncounter(partial: Pick<EncounterState, 'activeCombatantId' | 'combatantsById'>): EncounterState {
  return partial as EncounterState
}

const baseViewer = (
  overrides: Partial<EncounterViewerContext> & Pick<EncounterViewerContext, 'mode' | 'viewerRole' | 'controlledCombatantIds'>,
): EncounterViewerContext => ({
  simulatorViewerMode: 'active-combatant',
  ...overrides,
})

describe('deriveEncounterCapabilities', () => {
  it('simulator mode grants full turn and DM-tool capabilities', () => {
    const encounter = stubEncounter({
      activeCombatantId: 'goblin',
      combatantsById: {
        goblin: minimalCombatant('goblin', { kind: 'monster', sourceId: 'm1', label: 'G' }, 'enemies'),
      },
    })
    const caps = deriveEncounterCapabilities(encounter, {
      ...baseViewer({ mode: 'simulator', viewerRole: 'dm', controlledCombatantIds: [] }),
    })
    expect(caps.canMoveActiveCombatant).toBe(true)
    expect(caps.canEndTurn).toBe(true)
    expect(caps.canOpenDmTools).toBe(true)
    expect(caps.tonePerspective).toBe('dm')
  })

  it('session DM seat: turn actions only when controlling active; DM tools always', () => {
    const encounter = stubEncounter({
      activeCombatantId: 'pc1',
      combatantsById: {
        pc1: minimalCombatant('pc1', { kind: 'pc', sourceId: 'char-a', label: 'Hero' }, 'party'),
        m1: minimalCombatant('m1', { kind: 'monster', sourceId: 'gob', label: 'Gob' }, 'enemies'),
      },
    })
    const dmControlsMonster = deriveEncounterCapabilities(encounter, {
      ...baseViewer({
        mode: 'session',
        viewerRole: 'dm',
        controlledCombatantIds: ['m1'],
      }),
    })
    expect(dmControlsMonster.canMoveActiveCombatant).toBe(false)
    expect(dmControlsMonster.canOpenDmTools).toBe(true)
    expect(dmControlsMonster.canViewEnemyIntent).toBe(true)

    const encounterMonsterActive = stubEncounter({
      activeCombatantId: 'm1',
      combatantsById: encounter.combatantsById,
    })
    const dmOnMonsterTurn = deriveEncounterCapabilities(encounterMonsterActive, {
      ...baseViewer({
        mode: 'session',
        viewerRole: 'dm',
        controlledCombatantIds: ['m1'],
      }),
    })
    expect(dmOnMonsterTurn.canMoveActiveCombatant).toBe(true)
    expect(dmOnMonsterTurn.canEndTurn).toBe(true)
  })

  it('session player: turn actions only on own PC; no DM tools', () => {
    const encounter = stubEncounter({
      activeCombatantId: 'pc1',
      combatantsById: {
        pc1: minimalCombatant('pc1', { kind: 'pc', sourceId: 'char-a', label: 'Hero' }, 'party'),
        m1: minimalCombatant('m1', { kind: 'monster', sourceId: 'gob', label: 'Gob' }, 'enemies'),
      },
    })
    const onOwnTurn = deriveEncounterCapabilities(encounter, {
      ...baseViewer({
        mode: 'session',
        viewerRole: 'player',
        controlledCombatantIds: ['pc1'],
      }),
    })
    expect(onOwnTurn.canMoveActiveCombatant).toBe(true)
    expect(onOwnTurn.canOpenDmTools).toBe(false)
    expect(onOwnTurn.tonePerspective).toBe('self')

    const encounterMonsterActive = stubEncounter({ ...encounter, activeCombatantId: 'm1' })
    const watching = deriveEncounterCapabilities(encounterMonsterActive, {
      ...baseViewer({
        mode: 'session',
        viewerRole: 'player',
        controlledCombatantIds: ['pc1'],
      }),
    })
    expect(watching.canMoveActiveCombatant).toBe(false)
    expect(watching.tonePerspective).toBe('observer')
  })

  it('session observer: no turn actions; no DM tools', () => {
    const encounter = stubEncounter({
      activeCombatantId: 'm1',
      combatantsById: {
        m1: minimalCombatant('m1', { kind: 'monster', sourceId: 'gob', label: 'Gob' }, 'enemies'),
      },
    })
    const caps = deriveEncounterCapabilities(encounter, {
      ...baseViewer({
        mode: 'session',
        viewerRole: 'observer',
        controlledCombatantIds: [],
      }),
    })
    expect(caps.canMoveActiveCombatant).toBe(false)
    expect(caps.canOpenDmTools).toBe(false)
    expect(caps.tonePerspective).toBe('observer')
  })
})

describe('resolveSessionControlledCombatantIds', () => {
  const encounter = stubEncounter({
    activeCombatantId: 'm1',
    combatantsById: {
      pc1: minimalCombatant('pc1', { kind: 'pc', sourceId: 'char-a', label: 'Hero' }, 'party'),
      npc1: minimalCombatant('npc1', { kind: 'npc', sourceId: 'npc-char', label: 'Ally' }, 'party'),
      m1: minimalCombatant('m1', { kind: 'monster', sourceId: 'gob', label: 'Gob' }, 'enemies'),
    },
  })

  it('dm seat includes monsters and npcs', () => {
    const ids = resolveSessionControlledCombatantIds(encounter, { viewerRole: 'dm' })
    expect(ids.sort()).toEqual(['m1', 'npc1'].sort())
  })

  it('player seat includes matching pc source only', () => {
    expect(
      resolveSessionControlledCombatantIds(encounter, {
        viewerRole: 'player',
        playerCharacterId: 'char-a',
      }).sort(),
    ).toEqual(['pc1'])
    expect(resolveSessionControlledCombatantIds(encounter, { viewerRole: 'player', playerCharacterId: null })).toEqual([])
  })

  it('observer seat is empty', () => {
    expect(resolveSessionControlledCombatantIds(encounter, { viewerRole: 'observer' })).toEqual([])
  })
})
