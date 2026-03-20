import { describe, expect, it } from 'vitest'

import type { CombatantInstance } from '../../types'
import {
  getIncomingAttackModifiers,
  getIncomingAttackModifiersForAttack,
  getOutgoingAttackModifiers,
  getOutgoingAttackModifiersForAttack,
} from './condition-queries'

function makeCombatant(
  id: string,
  options: { conditions?: string[]; states?: string[] } = {},
): CombatantInstance {
  const { conditions = [], states = [] } = options
  return {
    instanceId: id,
    side: 'party',
    source: { kind: 'pc', sourceId: id, label: id },
    stats: {
      armorClass: 16,
      maxHitPoints: 20,
      currentHitPoints: 20,
      initiativeModifier: 2,
      dexterityScore: 14,
    },
    attacks: [],
    actions: [],
    activeEffects: [],
    runtimeEffects: [],
    turnHooks: [],
    conditions: conditions.map((label, i) => ({ id: `c-${id}-${i}`, label })),
    states: states.map((label, i) => ({ id: `s-${id}-${i}`, label })),
  }
}

describe('attack modifiers with attacker/defender pair (See Invisibility)', () => {
  it('gives incoming disadvantage vs invisible defender without see invisibility on attacker', () => {
    const attacker = makeCombatant('a')
    const defender = makeCombatant('d', { conditions: ['invisible'] })
    expect(getIncomingAttackModifiers(defender, 'ranged')).toContain('disadvantage')
    expect(getIncomingAttackModifiersForAttack(attacker, defender, 'ranged')).toContain('disadvantage')
  })

  it('suppresses incoming disadvantage vs invisible defender when attacker has see-invisibility', () => {
    const attacker = makeCombatant('a', { states: ['see-invisibility'] })
    const defender = makeCombatant('d', { conditions: ['invisible'] })
    expect(getIncomingAttackModifiers(defender, 'ranged')).toContain('disadvantage')
    expect(getIncomingAttackModifiersForAttack(attacker, defender, 'ranged')).not.toContain('disadvantage')
  })

  it('gives outgoing advantage for invisible attacker without see invisibility on defender', () => {
    const attacker = makeCombatant('a', { conditions: ['invisible'] })
    const defender = makeCombatant('d')
    expect(getOutgoingAttackModifiers(attacker, 'ranged')).toContain('advantage')
    expect(getOutgoingAttackModifiersForAttack(attacker, defender, 'ranged')).toContain('advantage')
  })

  it('suppresses outgoing advantage for invisible attacker when defender has see-invisibility', () => {
    const attacker = makeCombatant('a', { conditions: ['invisible'] })
    const defender = makeCombatant('d', { states: ['see-invisibility'] })
    expect(getOutgoingAttackModifiers(attacker, 'ranged')).toContain('advantage')
    expect(getOutgoingAttackModifiersForAttack(attacker, defender, 'ranged')).not.toContain('advantage')
  })
})
