import type { DeriveEncounterPresentationGridPerceptionInputArgs } from '@/features/mechanics/domain/combat/presentation/perception/derive-encounter-presentation-grid-perception'
import type { EncounterState } from '@/features/mechanics/domain/combat'
import type {
  EncounterSessionSeat,
  EncounterSimulatorViewerMode,
} from '@/features/mechanics/domain/combat/selectors/capabilities/encounter-capabilities.types'

/**
 * Session live play: presentation POV for grid/header is derived from **seat** (DM overview vs active-combatant),
 * not from a simulator-style POV switcher. Use the same value for `EncounterViewerContext.simulatorViewerMode`
 * when that context should reflect grid perception policy.
 */
export function sessionEncounterPresentationSimulatorViewerMode(
  viewerRole: EncounterSessionSeat,
): Extract<EncounterSimulatorViewerMode, 'dm' | 'active-combatant'> {
  return viewerRole === 'dm' ? 'dm' : 'active-combatant'
}

export type BuildEncounterPresentationGridPerceptionInputArgsSession = {
  hostMode: 'session'
  viewerRole: EncounterSessionSeat
  encounterState: EncounterState | null | undefined
  activeCombatantId: string | null | undefined
}

export type BuildEncounterPresentationGridPerceptionInputArgsSimulator = {
  hostMode: 'simulator'
  encounterState: EncounterState | null | undefined
  activeCombatantId: string | null | undefined
  simulatorViewerMode: EncounterSimulatorViewerMode
  presentationSelectedCombatantId: string | null | undefined
}

export type BuildEncounterPresentationGridPerceptionInputArgsOptions =
  | BuildEncounterPresentationGridPerceptionInputArgsSession
  | BuildEncounterPresentationGridPerceptionInputArgsSimulator

/**
 * Canonical encounter-layer args for {@link deriveEncounterPresentationGridPerceptionInput}, so session and
 * simulator hosts do not duplicate presentation policy.
 *
 * - **Session** — `simulatorViewerMode` comes from seat (`dm` → DM overview); `presentationSelectedCombatantId`
 *   is always `null` until product adds session “view as” POV.
 * - **Simulator** — passes through UI state (`simulatorViewerMode`, `presentationSelectedCombatantId`).
 */
export function buildEncounterPresentationGridPerceptionInputArgs(
  opts: BuildEncounterPresentationGridPerceptionInputArgsOptions,
): DeriveEncounterPresentationGridPerceptionInputArgs {
  if (opts.hostMode === 'session') {
    return {
      encounterState: opts.encounterState,
      simulatorViewerMode: sessionEncounterPresentationSimulatorViewerMode(opts.viewerRole),
      activeCombatantId: opts.activeCombatantId,
      presentationSelectedCombatantId: null,
    }
  }
  return {
    encounterState: opts.encounterState,
    simulatorViewerMode: opts.simulatorViewerMode,
    activeCombatantId: opts.activeCombatantId,
    presentationSelectedCombatantId: opts.presentationSelectedCombatantId,
  }
}
