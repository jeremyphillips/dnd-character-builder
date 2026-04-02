import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { CombatantInstance } from '@/features/mechanics/domain/combat'
import { createEncounterState } from '@/features/mechanics/domain/combat/state'
import { createSquareGridSpace } from '@/features/mechanics/domain/combat/space/creation/createSquareGridSpace'
import type { EncounterState } from '@/features/mechanics/domain/combat'
import { useEncounterState } from './useEncounterState'

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

function withGridMovement(c: CombatantInstance): CombatantInstance {
  return {
    ...c,
    stats: { ...c.stats, speeds: { ground: 120 } },
    turnResources: {
      actionAvailable: true,
      bonusActionAvailable: true,
      reactionAvailable: true,
      opportunityAttackReactionsRemaining: 1,
      movementRemaining: 120,
      hasCastBonusActionSpell: false,
    },
  }
}

function buildHydratedState(combatants: CombatantInstance[], opts?: { space?: ReturnType<typeof createSquareGridSpace> }): EncounterState {
  const base = createEncounterState(combatants, { rng: () => 0.5, space: opts?.space })
  return {
    ...base,
    initiativeOrder: combatants.map((c) => c.instanceId),
    activeCombatantId: combatants[0].instanceId,
    turnIndex: 0,
  }
}

describe('useEncounterState – hydrated mode intent handlers', () => {
  it('handleNextTurn advances turn after hydration', () => {
    const state = buildHydratedState([
      baseCombatant('pc-1', 'party', 20, 5),
      baseCombatant('orc-1', 'enemies', 20, 0),
    ])

    const { result } = renderHook(() =>
      useEncounterState({
        selectedCombatantIds: ['pc-1', 'orc-1'],
        opponentRoster: [],
        monstersById: {},
        hydratedEncounterState: state,
      }),
    )

    expect(result.current.encounterState?.activeCombatantId).toBe('pc-1')

    act(() => result.current.handleNextTurn())

    expect(result.current.encounterState?.activeCombatantId).toBe('orc-1')
  })

  it('handleMoveCombatant moves active combatant after hydration', () => {
    const space = createSquareGridSpace({ id: 'test-map', name: 'Test', columns: 8, rows: 8 })
    const state: EncounterState = {
      ...buildHydratedState(
        [
          withGridMovement(baseCombatant('wiz', 'party', 20, 5)),
          withGridMovement(baseCombatant('orc', 'enemies', 20, 0)),
        ],
        { space },
      ),
      placements: [
        { combatantId: 'wiz', cellId: 'c-0-0' },
        { combatantId: 'orc', cellId: 'c-4-4' },
      ],
    }

    const { result } = renderHook(() =>
      useEncounterState({
        selectedCombatantIds: ['wiz', 'orc'],
        opponentRoster: [],
        monstersById: {},
        hydratedEncounterState: state,
      }),
    )

    expect(result.current.encounterState).not.toBeNull()

    act(() => result.current.handleMoveCombatant('c-1-0'))

    const placement = result.current.encounterState?.placements?.find(
      (p) => p.combatantId === 'wiz',
    )
    expect(placement?.cellId).toBe('c-1-0')
  })
})
