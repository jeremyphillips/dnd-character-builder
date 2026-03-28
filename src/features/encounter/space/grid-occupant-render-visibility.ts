/**
 * Grid token render seam: combines the shared occupant-perception seam with stealth bookkeeping.
 * Does not remove combatants from state — presentation-only.
 *
 * @see canPerceiveTargetOccupantForCombat — world, LoS/LoE, conditions, invisibility
 * @see isHiddenFromObserver — observer-relative `hiddenFromObserverIds` (kept aligned by reconciliation)
 */
import { canPerceiveTargetOccupantForCombat } from '@/features/mechanics/domain/encounter/state/visibility/combatant-pair-visibility'
import { isHiddenFromObserver } from '@/features/mechanics/domain/encounter/state/stealth/stealth-rules'
import type { EncounterViewerPerceptionCapabilities } from '@/features/mechanics/domain/encounter/environment/perception.types'
import type { EncounterState } from '@/features/mechanics/domain/encounter/state/types'

export function shouldRenderOccupantTokenForEncounterViewer(
  state: EncounterState,
  params: {
    viewerCombatantId: string
    viewerRole: 'dm' | 'pc'
    occupantCombatantId: string
    capabilities?: EncounterViewerPerceptionCapabilities
  },
): boolean {
  const { viewerCombatantId, viewerRole, occupantCombatantId, capabilities } = params
  if (viewerRole === 'dm') return true
  if (viewerCombatantId === occupantCombatantId) return true
  if (!canPerceiveTargetOccupantForCombat(state, viewerCombatantId, occupantCombatantId, { capabilities })) {
    return false
  }
  if (isHiddenFromObserver(state, viewerCombatantId, occupantCombatantId)) return false
  return true
}
