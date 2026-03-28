import { describe, expect, it } from 'vitest'

import { createSquareGridSpace } from '@/features/encounter/space/createSquareGridSpace'
import {
  applyStealthHideSuccess,
  breakStealthOnAttack,
  createEncounterState,
  getStealthHideAttemptDenialReason,
  isHiddenFromObserver,
  reconcileStealthBreakWhenNoConcealmentInCell,
  reconcileStealthHiddenForPerceivedObservers,
  resolveDefaultHideObservers,
} from '@/features/mechanics/domain/encounter/state'
import {
  encounterAttackerOutsideDefenderHeavilyObscured,
  testEnemy,
  testPc,
} from './encounter-visibility-test-fixtures'

describe('stealth-rules', () => {
  it('getStealthHideAttemptDenialReason delegates to hide eligibility (heavy obscurement allows attempt)', () => {
    const heavy = encounterAttackerOutsideDefenderHeavilyObscured()
    expect(getStealthHideAttemptDenialReason(heavy, 'orc', 'wiz')).toBe(null)
  })

  it('denies hide in bright open when observer perceives occupant', () => {
    const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
    const w = testPc('wiz', 'Wizard', 20)
    const o = testEnemy('orc', 'Orc', 20)
    const base = createEncounterState([w, o], { rng: () => 0.5, space })
    const state = {
      ...base,
      placements: [
        { combatantId: 'wiz', cellId: 'c-0-0' },
        { combatantId: 'orc', cellId: 'c-1-0' },
      ],
    }
    expect(getStealthHideAttemptDenialReason(state, 'orc', 'wiz')).toBe('observer-sees-without-concealment')
  })

  it('applyStealthHideSuccess records observer-relative hidden state', () => {
    const w = testPc('wiz', 'Wizard', 20)
    const o = testEnemy('orc', 'Orc', 20)
    const ally = testPc('ally', 'Ally', 20)
    const base = createEncounterState([w, o, ally], { rng: () => 0.5 })
    const state = {
      ...base,
      partyCombatantIds: ['wiz', 'ally'],
      enemyCombatantIds: ['orc'],
      initiativeOrder: ['wiz', 'orc', 'ally'],
    }
    const applied = applyStealthHideSuccess(state, 'orc', ['wiz'])
    expect(applied.combatantsById.orc?.stealth?.hiddenFromObserverIds).toEqual(['wiz'])
    expect(isHiddenFromObserver(applied, 'wiz', 'orc')).toBe(true)
    expect(isHiddenFromObserver(applied, 'ally', 'orc')).toBe(false)
  })

  it('reconcileStealthHiddenForPerceivedObservers removes observer when they can perceive subject', () => {
    const w = testPc('wiz', 'Wizard', 20)
    const o = testEnemy('orc', 'Orc', 20)
    const base = createEncounterState([w, o], { rng: () => 0.5 })
    let state = {
      ...base,
      partyCombatantIds: ['wiz'],
      enemyCombatantIds: ['orc'],
      initiativeOrder: ['wiz', 'orc'],
      combatantsById: {
        ...base.combatantsById,
        orc: {
          ...base.combatantsById.orc!,
          stealth: { hiddenFromObserverIds: ['wiz'] },
        },
      },
    }
    const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
    state = { ...state, space, placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-1-0' },
    ] }
    const pruned = reconcileStealthHiddenForPerceivedObservers(state)
    expect(pruned.combatantsById.orc?.stealth).toBeUndefined()
  })

  it('breakStealthOnAttack clears stealth wrapper', () => {
    const w = testPc('wiz', 'Wizard', 20)
    const o = testEnemy('orc', 'Orc', 20)
    const base = createEncounterState([w, o], { rng: () => 0.5 })
    const withStealth = {
      ...base,
      combatantsById: {
        ...base.combatantsById,
        orc: {
          ...base.combatantsById.orc!,
          stealth: { hiddenFromObserverIds: ['wiz'] },
        },
      },
    }
    const cleared = breakStealthOnAttack(withStealth, 'orc')
    expect(cleared.combatantsById.orc?.stealth).toBeUndefined()
  })

  it('reconcileStealthBreakWhenNoConcealmentInCell clears stealth in bright open cell', () => {
    const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
    const w = testPc('wiz', 'Wizard', 20)
    const o = testEnemy('orc', 'Orc', 20)
    const base = createEncounterState([w, o], { rng: () => 0.5, space })
    const state = {
      ...base,
      placements: [
        { combatantId: 'wiz', cellId: 'c-0-0' },
        { combatantId: 'orc', cellId: 'c-1-0' },
      ],
      combatantsById: {
        ...base.combatantsById,
        orc: {
          ...base.combatantsById.orc!,
          stealth: { hiddenFromObserverIds: ['wiz'] },
        },
      },
    }
    const out = reconcileStealthBreakWhenNoConcealmentInCell(state, 'orc')
    expect(out.combatantsById.orc?.stealth).toBeUndefined()
  })

  it('resolveDefaultHideObservers lists enemies passing eligibility (non-contested)', () => {
    const heavy = encounterAttackerOutsideDefenderHeavilyObscured()
    const ids = resolveDefaultHideObservers(heavy, 'orc')
    expect(ids).toContain('wiz')
  })
})
