import type { AlertProps } from '@mui/material/Alert'

import type { CombatLogEvent } from '@/features/mechanics/domain/combat'
import type { EncounterState } from '@/features/mechanics/domain/combat/state/types'
import type { EncounterSessionSeat } from '@/features/mechanics/domain/combat/selectors/capabilities/encounter-capabilities.types'
import type { AppAlertTone } from '@/ui/primitives'

/** Structural outcome for policy (no tone). */
export type ActionResolvedOutcomeMeta = {
  hitCount: number
  missCount: number
  hasNat1Miss: boolean
}

export type EncounterToastEventKind = 'action_resolved' | 'turn_changed'

export type EncounterToastEvent =
  | {
      kind: 'action_resolved'
      dedupeKey: string
      events: CombatLogEvent[]
      encounterStateAfter: EncounterState | undefined
      title: string
      narrative: string
      mechanics: string
      outcome: ActionResolvedOutcomeMeta
    }
  | {
      kind: 'turn_changed'
      dedupeKey: string
      encounterStateAfter: EncounterState | undefined
      neutral: TurnChangedNeutralPayload
    }

export type ActionResolvedViewerRelationship =
  | 'actor_controller'
  | 'target_controller'
  | 'dm_observer'
  | 'uninvolved_observer'

export type TurnChangedViewerRelationship =
  | 'ended_turn_controller'
  | 'new_turn_controller'
  | 'participant_observer'
  | 'dm_observer'
  | 'uninvolved_observer'

/** Viewer-agnostic turn transition (no tone / no viewer copy). */
export type TurnChangedNeutralPayload = {
  endedActiveId: string
  nextActiveId: string
  round: number
  turn: number
  dedupeKey: string
  nextDisplayName: string
}

export type NormalizedToastViewerContext =
  | { mode: 'simulator' }
  | {
      mode: 'session'
      controlledCombatantIds: string[]
      tonePerspective: 'self' | 'observer' | 'dm'
    }

/** Raw viewer inputs before simulator/session normalization. */
export type EncounterToastViewerInput = {
  viewerMode: 'simulator' | 'session'
  controlledCombatantIds: string[]
  tonePerspective: 'self' | 'observer' | 'dm'
  /** Session seat; distinguishes observer seat from player “watching” (`tonePerspective` alone cannot). */
  viewerRole?: EncounterSessionSeat
  /** Simulator: selected combatant POV; `deriveTurnChangedViewerRelationship` falls back to `EncounterState.activeCombatantId`. */
  simulatorPresentationCombatantId?: string | null
}

/** Per-kind defaults before relationship-specific overrides. */
export type EncounterToastKindDefaults = {
  defaultVariant: AlertProps['variant']
  defaultAutoHideDuration: number | null
  /** Baseline before relationship / event policy (e.g. action_resolved usually shows). */
  defaultShow: boolean
}

/** Policy output: dimensions stay explicit (not one opaque blob). */
export type EncounterToastPolicyDimensions = {
  show: boolean
  tone: AppAlertTone
  variant: AlertProps['variant']
  autoHideDuration: number | null
}

/** Final props for AppToast (presentation). */
export type EncounterToastPresentation = {
  title: string
  children: string
  mechanics: string | undefined
  tone: AppAlertTone
  variant: AlertProps['variant']
  autoHideDuration: number | null
  dedupeKey: string
}
