import { describe, expect, it } from 'vitest'

import {
  addStatModifierToCombatant,
  createEncounterState,
  patchCombatantEquipmentSnapshot,
} from '../state'
import type { CombatantInstance } from '../state'

function minimalPc(id: string, ac: number): CombatantInstance {
  return {
    instanceId: id,
    side: 'party',
    source: { kind: 'pc', sourceId: id, label: 'Hero' },
    equipment: { armorEquipped: null },
    stats: {
      armorClass: ac,
      maxHitPoints: 20,
      currentHitPoints: 20,
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

describe('patchCombatantEquipmentSnapshot', () => {
  it('removes unarmored-only stat modifiers when armor is equipped and restores AC (set mode snapshot)', () => {
    const c = minimalPc('pc-1', 12)
    const state = createEncounterState([c], { rng: () => 0.5 })
    const withMod = addStatModifierToCombatant(state, 'pc-1', {
      id: 'ma-1',
      label: 'set 13 armor_class',
      target: 'armor_class',
      mode: 'set',
      value: 13,
      eligibility: { requiresUnarmored: true },
      armorClassBeforeApply: 12,
    })
    expect(withMod.combatantsById['pc-1']!.stats.armorClass).toBe(13)

    const patched = patchCombatantEquipmentSnapshot(withMod, 'pc-1', { armorEquipped: 'leather-1' })
    expect(patched.combatantsById['pc-1']!.statModifiers ?? []).toHaveLength(0)
    expect(patched.combatantsById['pc-1']!.stats.armorClass).toBe(12)
  })

  it('removes add-mode unarmored modifiers and reverses AC', () => {
    const c = minimalPc('pc-1', 15)
    const state = createEncounterState([c], { rng: () => 0.5 })
    const withMod = addStatModifierToCombatant(state, 'pc-1', {
      id: 'buff-1',
      label: '+2 AC',
      target: 'armor_class',
      mode: 'add',
      value: 2,
      eligibility: { requiresUnarmored: true },
    })
    expect(withMod.combatantsById['pc-1']!.stats.armorClass).toBe(17)

    const patched = patchCombatantEquipmentSnapshot(withMod, 'pc-1', { armorEquipped: 'chain-1' })
    expect(patched.combatantsById['pc-1']!.stats.armorClass).toBe(15)
  })
})
