import type { EncounterState } from '@/features/mechanics/domain/combat'

import {
  useEncounterCombatActiveHeader,
  type UseEncounterCombatActiveHeaderArgs,
} from './useEncounterCombatActiveHeader'
import { useEncounterGridViewModel, type UseEncounterGridViewModelArgs } from './useEncounterGridViewModel'

/**
 * Input bundle for {@link useEncounterRuntimePresentation}: authoritative + presentation encounter
 * state, grid/header shared fields, and host policy callbacks.
 */
export type EncounterRuntimePresentationInput = Omit<UseEncounterGridViewModelArgs, 'encounterState'> &
  Omit<UseEncounterCombatActiveHeaderArgs, 'encounterState' | 'gridViewModel' | 'combatantViewerPresentationKindById'> & {
    presentationEncounterState: EncounterState | null
    encounterState: EncounterState | null
  }

export type EncounterRuntimePresentationResult = Pick<
  ReturnType<typeof useEncounterGridViewModel>,
  'gridViewModel' | 'combatantViewerPresentationKindById'
> &
  ReturnType<typeof useEncounterCombatActiveHeader>

/**
 * Encounter **runtime presentation** composition seam for shared play surfaces: delegates to
 * `useEncounterGridViewModel` then `useEncounterCombatActiveHeader`. Additional presentation outputs
 * can be added here without renaming the hook.
 */
export function useEncounterRuntimePresentation(
  input: EncounterRuntimePresentationInput,
): EncounterRuntimePresentationResult {
  const {
    presentationEncounterState,
    encounterState,
    activeCombatantId,
    activeCombatant,
    selectedAction,
    selectedActionTargetId,
    selectedCasterOptions,
    aoeStep,
    aoeHoverCellId,
    aoeOriginCellId,
    interactionMode,
    singleCellPlacementHoverCellId,
    selectedSingleCellPlacementCellId,
    presentationGridPerceptionInput,
    availableActions,
    selectedActionId,
    selectedObjectAnchorId,
    viewerContext,
    simulatorViewerMode,
    onSimulatorViewerModeChange,
    handleNextTurn,
    handleResetEncounter,
    setActionDrawerOpen,
    onEditEncounter,
    monstersById,
    spellsById,
    suppressSameSideHostile,
    sceneViewerSlot,
  } = input

  const { gridViewModel, combatantViewerPresentationKindById } = useEncounterGridViewModel({
    encounterState: presentationEncounterState,
    activeCombatantId,
    activeCombatant,
    selectedAction,
    selectedActionTargetId,
    selectedCasterOptions,
    aoeStep,
    aoeHoverCellId,
    aoeOriginCellId,
    interactionMode,
    singleCellPlacementHoverCellId,
    selectedSingleCellPlacementCellId,
    presentationGridPerceptionInput,
  })

  const { activeHeader, capabilities, encounterDirective, contextStripTitleTone } = useEncounterCombatActiveHeader({
    encounterState,
    activeCombatant,
    availableActions,
    selectedActionId,
    selectedAction,
    selectedCasterOptions,
    aoeStep,
    aoeOriginCellId,
    selectedActionTargetId,
    selectedSingleCellPlacementCellId,
    selectedObjectAnchorId,
    interactionMode,
    gridViewModel,
    combatantViewerPresentationKindById,
    presentationGridPerceptionInput,
    viewerContext,
    simulatorViewerMode,
    onSimulatorViewerModeChange,
    handleNextTurn,
    handleResetEncounter,
    setActionDrawerOpen,
    onEditEncounter,
    monstersById,
    spellsById,
    suppressSameSideHostile,
    sceneViewerSlot,
  })

  return {
    gridViewModel,
    combatantViewerPresentationKindById,
    activeHeader,
    capabilities,
    encounterDirective,
    contextStripTitleTone,
  }
}
