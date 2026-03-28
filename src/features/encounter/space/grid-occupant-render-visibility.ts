/**
 * Grid + bookkeeping **presentation** seam: maps existing rule outputs to viewer-facing labels.
 * Does not implement stealth/perception rules — only derives presentation from:
 * - {@link canPerceiveTargetOccupantForCombat}
 * - {@link isHiddenFromObserver}
 * - viewer role (DM omniscience, self)
 *
 * @see canPerceiveTargetOccupantForCombat — world, LoS/LoE, conditions, invisibility
 * @see isHiddenFromObserver — observer-relative `hiddenFromObserverIds`
 */
import type { ViewerCombatantPresentationKind } from '@/features/encounter/domain'
import {
  mergeGridPerceptionInputCapabilities,
  type GridPerceptionInput,
} from '@/features/mechanics/domain/encounter/environment/perception.render.projection'
import { canPerceiveTargetOccupantForCombat } from '@/features/mechanics/domain/encounter/state/visibility/combatant-pair-visibility'
import { isHiddenFromObserver } from '@/features/mechanics/domain/encounter/state/stealth/stealth-rules'
import type { EncounterViewerPerceptionCapabilities } from '@/features/mechanics/domain/encounter/environment/perception.types'
import type { EncounterState } from '@/features/mechanics/domain/encounter/state/types'

export type { ViewerCombatantPresentationKind }

/**
 * Presentation precedence (explicit; rules unchanged):
 *
 * 1. **DM viewer** → `visible` (omniscient tactical presentation).
 * 2. **Self** → `visible`.
 * 3. **`!canPerceiveTargetOccupantForCombat`** → **`out-of-sight`** — LOS, darkness, obscurement,
 *    conditions, invisibility, etc. This wins over stealth presentation when both could apply:
 *    the primary reason the occupant is not shown is sensory/geometry, not the Hide list alone.
 * 4. **`isHiddenFromObserver`** → **`hidden`** — only when occupant **would** be perceivable via the
 *    pair seam (Hide / stealth bookkeeping while not blocked by step 3).
 * 5. Else → **`visible`**.
 *
 * Reconciliation timing is unchanged; this function only reads current state.
 */
export function deriveViewerCombatantPresentationKind(
  state: EncounterState,
  params: {
    viewerCombatantId: string
    viewerRole: 'dm' | 'pc'
    occupantCombatantId: string
    capabilities?: EncounterViewerPerceptionCapabilities
  },
): ViewerCombatantPresentationKind {
  const { viewerCombatantId, viewerRole, occupantCombatantId, capabilities } = params
  if (viewerRole === 'dm') return 'visible'
  if (viewerCombatantId === occupantCombatantId) return 'visible'
  if (!canPerceiveTargetOccupantForCombat(state, viewerCombatantId, occupantCombatantId, { capabilities })) {
    return 'out-of-sight'
  }
  if (isHiddenFromObserver(state, viewerCombatantId, occupantCombatantId)) return 'hidden'
  return 'visible'
}

/** Strict POV: render normal token only when presentation is `visible`. */
export function shouldRenderOccupantTokenForEncounterViewer(
  state: EncounterState,
  params: {
    viewerCombatantId: string
    viewerRole: 'dm' | 'pc'
    occupantCombatantId: string
    capabilities?: EncounterViewerPerceptionCapabilities
  },
): boolean {
  return deriveViewerCombatantPresentationKind(state, params) === 'visible'
}

/**
 * Bookkeeping UI (initiative sidebar, turn-order modal, header). Same viewer input as grid.
 * When `input` is omitted, every id is `visible` (legacy callers without POV).
 */
export function buildCombatantViewerPresentationKindById(
  state: EncounterState,
  input: GridPerceptionInput | undefined,
  combatantIds: readonly string[],
): Record<string, ViewerCombatantPresentationKind> {
  const out: Record<string, ViewerCombatantPresentationKind> = {}
  if (!input) {
    for (const id of combatantIds) out[id] = 'visible'
    return out
  }
  const caps = mergeGridPerceptionInputCapabilities(input)
  for (const id of combatantIds) {
    out[id] = deriveViewerCombatantPresentationKind(state, {
      viewerCombatantId: input.viewerCombatantId,
      viewerRole: input.viewerRole,
      occupantCombatantId: id,
      capabilities: caps,
    })
  }
  return out
}
