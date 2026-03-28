import { describe, expect, it } from 'vitest'

import { createSquareGridSpace } from '@/features/encounter/space/createSquareGridSpace'
import { resolveViewerPerceptionForCellFromState } from '@/features/mechanics/domain/encounter/environment/perception.resolve'
import { resolveRollModifier } from '@/features/mechanics/domain/encounter/resolution/action/action-resolver'
import {
  addConditionToCombatant,
  canPerceiveTargetOccupantForCombat,
  createEncounterState,
  resolveCombatantPairVisibilityForAttackRoll,
} from '@/features/mechanics/domain/encounter/state'
import type { CombatantInstance } from '@/features/mechanics/domain/encounter/state/types'
import type { EncounterState } from '@/features/mechanics/domain/encounter/state/types'

function pc(id: string, label: string, hp: number): CombatantInstance {
  return {
    instanceId: id,
    side: 'party',
    source: { kind: 'pc', sourceId: id, label },
    stats: {
      armorClass: 14,
      maxHitPoints: hp,
      currentHitPoints: hp,
      initiativeModifier: 0,
      dexterityScore: 14,
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

function enemy(id: string, label: string, hp: number): CombatantInstance {
  return {
    instanceId: id,
    side: 'enemies',
    source: { kind: 'monster', sourceId: id, label },
    stats: {
      armorClass: 12,
      maxHitPoints: hp,
      currentHitPoints: hp,
      initiativeModifier: 0,
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

/**
 * Attacker in bright cell; defender only in heavy obscurement (environmental, not a condition row).
 * Viewer can perceive the obscured cell/region but not the occupant; defender can still perceive the attacker’s cell.
 */
function encounterAttackerOutsideDefenderHeavilyObscured(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = pc('wiz', 'Wizard', 20)
  const orc = enemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
    environmentZones: [
      {
        id: 'z-heavy',
        kind: 'patch',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['c-2-2'] },
        overrides: { visibilityObscured: 'heavy' },
      },
    ],
  }
}

describe('combatant pair visibility (occupant)', () => {
  it('uses permissive occupant visibility when space/placements are missing (after condition gates)', () => {
    const w = pc('w', 'Wizard', 20)
    const g = enemy('g', 'Goblin', 10)
    const noGrid = createEncounterState([w, g], { rng: () => 0.5 })
    expect(noGrid.space).toBeUndefined()
    expect(canPerceiveTargetOccupantForCombat(noGrid, 'w', 'g')).toBe(true)
  })

  it('still blocks invisible target when no grid (does not use permissive before invisible check)', () => {
    const w = pc('w', 'Wizard', 20)
    const g = enemy('g', 'Goblin', 10)
    const state = addConditionToCombatant(createEncounterState([w, g], { rng: () => 0.5 }), 'g', 'invisible')
    expect(state.space).toBeUndefined()
    expect(canPerceiveTargetOccupantForCombat(state, 'w', 'g')).toBe(false)
  })

  it('heavy obscurement on defender: perceives cell but not occupant; unseen-target disadvantage on attack roll', () => {
    const state = encounterAttackerOutsideDefenderHeavilyObscured()
    const cell = resolveViewerPerceptionForCellFromState(state, 'wiz', 'c-2-2', { viewerRole: 'pc' })
    expect(cell?.canPerceiveCell).toBe(true)
    expect(cell?.canPerceiveOccupants).toBe(false)

    expect(canPerceiveTargetOccupantForCombat(state, 'wiz', 'orc')).toBe(false)
    expect(canPerceiveTargetOccupantForCombat(state, 'orc', 'wiz')).toBe(true)

    const pair = resolveCombatantPairVisibilityForAttackRoll(state, 'wiz', 'orc')
    expect(pair.attackerCanSeeDefenderOccupant).toBe(false)
    expect(pair.defenderCanSeeAttackerOccupant).toBe(true)

    const { rollMod, pairVisibility } = resolveRollModifier(
      state.combatantsById.wiz!,
      state.combatantsById.orc!,
      'melee',
      state,
    )
    expect(rollMod).toBe('disadvantage')
    expect(pairVisibility?.attackerCanSeeDefenderOccupant).toBe(false)
    expect(pairVisibility?.defenderCanSeeAttackerOccupant).toBe(true)
  })
})
