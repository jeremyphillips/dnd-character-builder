import { describe, expect, it } from 'vitest'

import {
  useEncounterRuntimePresentation,
  type EncounterRuntimePresentationInput,
} from './useEncounterRuntimePresentation'

describe('useEncounterRuntimePresentation', () => {
  it('exports the runtime presentation composition hook', () => {
    expect(typeof useEncounterRuntimePresentation).toBe('function')
  })

  it('EncounterRuntimePresentationInput is a structural type for host wiring', () => {
    const satisfies: EncounterRuntimePresentationInput = {
      presentationEncounterState: null,
      encounterState: null,
      activeCombatantId: null,
      activeCombatant: null,
      selectedAction: null,
      selectedActionTargetId: '',
      selectedCasterOptions: {},
      aoeStep: 'none',
      aoeHoverCellId: null,
      aoeOriginCellId: null,
      interactionMode: 'select-target',
      singleCellPlacementHoverCellId: null,
      selectedSingleCellPlacementCellId: null,
      presentationGridPerceptionInput: undefined,
      availableActions: [],
      selectedActionId: '',
      selectedObjectAnchorId: null,
      viewerContext: {} as EncounterRuntimePresentationInput['viewerContext'],
      simulatorViewerMode: 'dm',
      onSimulatorViewerModeChange: () => {},
      handleNextTurn: () => {},
      handleResetEncounter: () => {},
      setActionDrawerOpen: () => {},
      onEditEncounter: () => {},
      monstersById: {},
      spellsById: undefined,
      suppressSameSideHostile: false,
    }
    expect(satisfies).toBeDefined()
  })
})
