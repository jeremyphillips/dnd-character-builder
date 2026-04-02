import type { EncounterToastPolicyDimensions, TurnChangedViewerRelationship } from './encounter-toast-types'

/**
 * Relationship → explicit dimensions for `turn_changed` (titles built in derive step).
 */
export function applyTurnChangedPolicyDimensions(
  relationship: TurnChangedViewerRelationship,
): EncounterToastPolicyDimensions {
  switch (relationship) {
    case 'ended_turn_controller':
      return {
        show: false,
        tone: 'info',
        variant: 'standard',
        autoHideDuration: 2000,
      }
    case 'new_turn_controller':
      return {
        show: true,
        tone: 'success',
        variant: 'standard',
        autoHideDuration: 3000,
      }
    case 'dm_observer':
    case 'participant_observer':
      return {
        show: true,
        tone: 'info',
        variant: 'standard',
        autoHideDuration: 2000,
      }
    case 'uninvolved_observer':
      return {
        show: false,
        tone: 'info',
        variant: 'standard',
        autoHideDuration: 2000,
      }
  }
}
