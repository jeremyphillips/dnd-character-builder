/**
 * Maps encounter **presentation POV** (simulator viewer mode + optional selected combatant) to
 * {@link GridPerceptionInput} for grid / sidebar / header visibility.
 *
 * Does not implement stealth or perception rules — only chooses which combatant id feeds the viewer seam.
 * Action ownership / turn resolution remain tied to {@link EncounterState.activeCombatantId}.
 *
 * **Canonical active encounter path:** `simulatorViewerMode === 'active-combatant'` yields a PC viewer id
 * matching the active combatant — this is what `EncounterRuntimeContext` passes into `selectGridViewModel`
 * so immersed-obscuration overlay suppression applies during the active turn. Callers that omit
 * `opts.perception` on the grid selector do not get viewer-relative immersion (legacy / outside-observer
 * fallback — see `selectGridViewModel` JSDoc).
 */
import { getEncounterViewerPerceptionCapabilitiesFromCombatant } from '@/features/mechanics/domain/perception/perception.capabilities'
import type { GridPerceptionDebugOverrides, GridPerceptionInput } from '@/features/mechanics/domain/perception/perception.render.projection'
import type { EncounterState } from '@/features/mechanics/domain/encounter'

import type { EncounterSimulatorViewerMode } from '../capabilities/encounter-capabilities.types'

export type DeriveEncounterPresentationGridPerceptionInputArgs = {
  encounterState: EncounterState | null | undefined
  simulatorViewerMode: EncounterSimulatorViewerMode
  /** Active turn combatant (action ownership); used for `active-combatant` mode and fallbacks. */
  activeCombatantId: string | null | undefined
  /**
   * When `simulatorViewerMode === 'selected-combatant'`, preferred viewer combatant.
   * If missing or invalid, falls back to `activeCombatantId` when valid.
   */
  presentationSelectedCombatantId: string | null | undefined
  debugPerceptionOverrides?: GridPerceptionDebugOverrides
}

function combatantExists(state: EncounterState, id: string | null | undefined): id is string {
  return Boolean(id && state.combatantsById[id])
}

function capabilitiesForViewer(
  encounterState: EncounterState,
  viewerCombatantId: string,
): GridPerceptionInput['capabilities'] {
  const c = encounterState.combatantsById[viewerCombatantId]
  return c ? getEncounterViewerPerceptionCapabilitiesFromCombatant(c) : undefined
}

/**
 * For DM overview: anchor the perception slice on a real combatant when possible.
 * Prefers active, then presentation selection, then initiative order, then any combatant id.
 */
function resolveDmViewerCombatantId(
  state: EncounterState,
  activeCombatantId: string | null | undefined,
  presentationSelectedCombatantId: string | null | undefined,
): string | null {
  if (combatantExists(state, activeCombatantId)) return activeCombatantId
  if (combatantExists(state, presentationSelectedCombatantId)) return presentationSelectedCombatantId
  for (const id of state.initiativeOrder) {
    if (combatantExists(state, id)) return id
  }
  const first = Object.keys(state.combatantsById)[0]
  return first ?? null
}

/**
 * Returns `undefined` when no valid viewer combatant can be resolved (legacy: no perception overlay).
 */
export function deriveEncounterPresentationGridPerceptionInput(
  args: DeriveEncounterPresentationGridPerceptionInputArgs,
): GridPerceptionInput | undefined {
  const {
    encounterState,
    simulatorViewerMode,
    activeCombatantId,
    presentationSelectedCombatantId,
    debugPerceptionOverrides,
  } = args

  if (!encounterState) return undefined

  const debug = debugPerceptionOverrides

  if (simulatorViewerMode === 'dm') {
    const viewerCombatantId = resolveDmViewerCombatantId(
      encounterState,
      activeCombatantId,
      presentationSelectedCombatantId,
    )
    if (!viewerCombatantId) return undefined
    const caps = capabilitiesForViewer(encounterState, viewerCombatantId)
    return { viewerCombatantId, viewerRole: 'dm', ...(caps ? { capabilities: caps } : {}), debugOverrides: debug }
  }

  if (simulatorViewerMode === 'active-combatant') {
    if (!combatantExists(encounterState, activeCombatantId)) return undefined
    const caps = capabilitiesForViewer(encounterState, activeCombatantId)
    return {
      viewerCombatantId: activeCombatantId,
      viewerRole: 'pc',
      ...(caps ? { capabilities: caps } : {}),
      debugOverrides: debug,
    }
  }

  // selected-combatant
  const fromSelection = combatantExists(encounterState, presentationSelectedCombatantId)
    ? presentationSelectedCombatantId
    : null
  const viewerCombatantId =
    fromSelection ?? (combatantExists(encounterState, activeCombatantId) ? activeCombatantId : null)
  if (!viewerCombatantId) return undefined
  const caps = capabilitiesForViewer(encounterState, viewerCombatantId)
  return { viewerCombatantId, viewerRole: 'pc', ...(caps ? { capabilities: caps } : {}), debugOverrides: debug }
}
