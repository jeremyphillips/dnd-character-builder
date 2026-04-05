import { describe, expect, it } from 'vitest'

import {
  buildEncounterPresentationGridPerceptionInputArgs,
  sessionEncounterPresentationSimulatorViewerMode,
} from './buildEncounterPresentationGridPerceptionInputArgs'

describe('sessionEncounterPresentationSimulatorViewerMode', () => {
  it('maps DM seat to dm presentation mode', () => {
    expect(sessionEncounterPresentationSimulatorViewerMode('dm')).toBe('dm')
  })

  it('maps player and observer to active-combatant presentation mode', () => {
    expect(sessionEncounterPresentationSimulatorViewerMode('player')).toBe('active-combatant')
    expect(sessionEncounterPresentationSimulatorViewerMode('observer')).toBe('active-combatant')
  })
})

describe('buildEncounterPresentationGridPerceptionInputArgs', () => {
  it('session: derives dm vs active-combatant from seat and fixes presentationSelectedCombatantId to null', () => {
    expect(
      buildEncounterPresentationGridPerceptionInputArgs({
        hostMode: 'session',
        viewerRole: 'dm',
        encounterState: null,
        activeCombatantId: 'a1',
      }),
    ).toEqual({
      encounterState: null,
      simulatorViewerMode: 'dm',
      activeCombatantId: 'a1',
      presentationSelectedCombatantId: null,
    })

    expect(
      buildEncounterPresentationGridPerceptionInputArgs({
        hostMode: 'session',
        viewerRole: 'player',
        encounterState: undefined,
        activeCombatantId: null,
      }),
    ).toEqual({
      encounterState: undefined,
      simulatorViewerMode: 'active-combatant',
      activeCombatantId: null,
      presentationSelectedCombatantId: null,
    })
  })

  it('simulator: passes through UI viewer mode and presentation selection', () => {
    expect(
      buildEncounterPresentationGridPerceptionInputArgs({
        hostMode: 'simulator',
        encounterState: null,
        activeCombatantId: 'x',
        simulatorViewerMode: 'selected-combatant',
        presentationSelectedCombatantId: 'sel',
      }),
    ).toEqual({
      encounterState: null,
      simulatorViewerMode: 'selected-combatant',
      activeCombatantId: 'x',
      presentationSelectedCombatantId: 'sel',
    })
  })
})
