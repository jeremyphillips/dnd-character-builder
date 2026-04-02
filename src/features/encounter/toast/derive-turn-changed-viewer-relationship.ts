import type { EncounterState } from '@/features/mechanics/domain/combat/state/types'

import type {
  EncounterToastViewerInput,
  NormalizedToastViewerContext,
  TurnChangedNeutralPayload,
  TurnChangedViewerRelationship,
} from './encounter-toast-types'

/**
 * Session: ended vs new controller vs DM vs party participant vs session observer.
 * Simulator: POV (`simulatorPresentationCombatantId` or current `activeCombatantId`) vs ended/next.
 */
export function deriveTurnChangedViewerRelationship(
  neutral: TurnChangedNeutralPayload,
  normalized: NormalizedToastViewerContext,
  viewerInput: EncounterToastViewerInput,
  stateAfter: EncounterState,
): TurnChangedViewerRelationship {
  const { endedActiveId, nextActiveId } = neutral

  if (normalized.mode === 'simulator') {
    const pov =
      viewerInput.simulatorPresentationCombatantId ?? stateAfter.activeCombatantId ?? null
    if (pov === nextActiveId) return 'new_turn_controller'
    if (pov === endedActiveId) return 'ended_turn_controller'
    return 'participant_observer'
  }

  const controlled = viewerInput.controlledCombatantIds
  const controls = (id: string) => controlled.includes(id)

  if (controls(nextActiveId)) return 'new_turn_controller'
  if (controls(endedActiveId)) return 'ended_turn_controller'
  if (viewerInput.viewerRole === 'dm') return 'dm_observer'
  if (viewerInput.viewerRole === 'player' && controlled.length > 0) return 'participant_observer'
  return 'uninvolved_observer'
}
