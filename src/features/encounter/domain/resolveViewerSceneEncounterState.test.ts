import { describe, expect, it } from 'vitest'

import { createEncounterState } from '@/features/mechanics/domain/combat/state'
import { createSquareGridSpace } from '@/features/mechanics/domain/combat/space/creation/createSquareGridSpace'
import type { EncounterState } from '@/features/mechanics/domain/combat'
import type { CombatantInstance } from '@/features/mechanics/domain/combat'

import { resolveViewerSceneEncounterState } from './resolveViewerSceneEncounterState'
import type { SceneFocus } from './sceneFocus.types'

function baseCombatant(id: string, side: CombatantInstance['side']): CombatantInstance {
  return {
    instanceId: id,
    side,
    source: { kind: side === 'party' ? 'pc' : 'monster', sourceId: id, label: id },
    stats: {
      armorClass: 10,
      maxHitPoints: 20,
      currentHitPoints: 20,
      initiativeModifier: 0,
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

function minimalEncounter(): EncounterState {
  const combatants = [baseCombatant('pc-1', 'party'), baseCombatant('m-1', 'enemies')]
  const space = createSquareGridSpace({ id: 'test-space', name: 'Test', columns: 8, rows: 8 })
  const base = createEncounterState(combatants, { rng: () => 0.5, space })
  return {
    ...base,
    initiativeOrder: combatants.map((c) => c.instanceId),
    activeCombatantId: combatants[0].instanceId,
    turnIndex: 0,
  }
}

describe('resolveViewerSceneEncounterState', () => {
  it('returns null when authoritative state is null', () => {
    const focus: SceneFocus = { kind: 'followEncounterSpace' }
    expect(resolveViewerSceneEncounterState(null, focus)).toBeNull()
  })

  it('returns the same reference for followEncounterSpace (Phase A identity)', () => {
    const auth = minimalEncounter()
    const focus: SceneFocus = { kind: 'followEncounterSpace' }
    expect(resolveViewerSceneEncounterState(auth, focus)).toBe(auth)
  })

  it('pinnedScene returns presentation slice for the focused encounter space id', () => {
    const auth = minimalEncounter()
    const spaceId = auth.space?.id
    if (!spaceId) throw new Error('expected space')
    const focus: SceneFocus = {
      kind: 'pinnedScene',
      encounterSpaceId: spaceId,
      sceneLocationId: null,
    }
    const pres = resolveViewerSceneEncounterState(auth, focus)
    expect(pres).not.toBe(auth)
    expect(pres?.space?.id).toBe(spaceId)
    expect(pres?.placements?.length).toBe(auth.placements?.length)
  })
})
