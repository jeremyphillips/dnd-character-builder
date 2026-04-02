import type { AlertProps } from '@mui/material/Alert'

import type { CombatLogEvent } from '@/features/mechanics/domain/combat'
import type { EncounterState } from '@/features/mechanics/domain/combat/state/types'
import type { AppAlertTone } from '@/ui/primitives'

import { buildActionResolvedNeutralContent } from '../helpers/actions/encounter-action-toast'

import { deriveActionResolvedViewerRelationship } from './derive-viewer-relationship'
import { deriveTurnChangedViewerRelationship } from './derive-turn-changed-viewer-relationship'
import { applyActionResolvedPolicyDimensions } from './encounter-toast-policy'
import { applyTurnChangedPolicyDimensions } from './encounter-toast-policy-turn-changed'
import { getEncounterToastKindDefaults } from './encounter-toast-defaults'
import { normalizeToastViewerContext } from './normalize-toast-viewer'
import { filterActionEventsForEncounterToast, parseTurnChangedFromNewLogSlice } from './turn-changed-neutral'
import type {
  EncounterToastEventKind,
  EncounterToastPresentation,
  EncounterToastViewerInput,
  TurnChangedViewerRelationship,
} from './encounter-toast-types'

function mergeWithKindDefaults(
  kind: EncounterToastEventKind,
  policy: {
    show: boolean
    tone: AppAlertTone
    variant: AlertProps['variant']
    autoHideDuration: number | null
  },
): {
  show: boolean
  tone: AppAlertTone
  variant: AlertProps['variant']
  autoHideDuration: number | null
} {
  const defaults = getEncounterToastKindDefaults(kind)
  return {
    show: policy.show && defaults.defaultShow,
    tone: policy.tone,
    variant: policy.variant ?? defaults.defaultVariant,
    autoHideDuration: policy.autoHideDuration ?? defaults.defaultAutoHideDuration,
  }
}

function turnChangedTitle(
  relationship: TurnChangedViewerRelationship,
  nextDisplayName: string,
): string {
  if (relationship === 'new_turn_controller') return `Your turn — ${nextDisplayName}`
  return `${nextDisplayName}'s turn`
}

/**
 * Derives zero or more toasts from a new combat-log suffix (action resolution + turn change).
 * Order: `action_resolved` first, then `turn_changed` when both apply.
 */
export function deriveEncounterToastsFromNewLogSlice(
  newEntries: CombatLogEvent[],
  stateAfter: EncounterState | undefined,
  viewerInput: EncounterToastViewerInput,
): EncounterToastPresentation[] {
  const out: EncounterToastPresentation[] = []
  if (newEntries.length === 0) return out

  const actionEvents = filterActionEventsForEncounterToast(newEntries)
  if (actionEvents.length > 0) {
    const neutral = buildActionResolvedNeutralContent(actionEvents, stateAfter)
    if (neutral) {
      const normalized = normalizeToastViewerContext(viewerInput)
      const relationship = deriveActionResolvedViewerRelationship(actionEvents, normalized)
      const rawPolicy = applyActionResolvedPolicyDimensions(neutral.outcome, relationship)
      const merged = mergeWithKindDefaults('action_resolved', rawPolicy)
      if (merged.show) {
        out.push({
          title: neutral.title,
          children: neutral.narrative,
          mechanics: neutral.mechanics.trim() ? neutral.mechanics : undefined,
          tone: merged.tone,
          variant: merged.variant,
          autoHideDuration: merged.autoHideDuration,
          dedupeKey: neutral.dedupeKey,
        })
      }
    }
  }

  if (!stateAfter) return out

  const turnNeutral = parseTurnChangedFromNewLogSlice(newEntries, stateAfter)
  if (!turnNeutral) return out

  const normalized = normalizeToastViewerContext(viewerInput)
  const turnRel = deriveTurnChangedViewerRelationship(turnNeutral, normalized, viewerInput, stateAfter)
  const rawTurn = applyTurnChangedPolicyDimensions(turnRel)
  const mergedTurn = mergeWithKindDefaults('turn_changed', rawTurn)
  if (!mergedTurn.show) return out

  const meta = `Round ${turnNeutral.round} · Turn ${turnNeutral.turn}`
  out.push({
    title: turnChangedTitle(turnRel, turnNeutral.nextDisplayName),
    children: meta,
    mechanics: undefined,
    tone: mergedTurn.tone,
    variant: mergedTurn.variant,
    autoHideDuration: mergedTurn.autoHideDuration,
    dedupeKey: turnNeutral.dedupeKey,
  })

  return out
}

/**
 * Back-compat: first presentation only (action before turn when both exist).
 */
export function deriveEncounterToastForViewer(
  events: CombatLogEvent[],
  stateAfter: EncounterState | undefined,
  viewerInput: EncounterToastViewerInput,
): EncounterToastPresentation | null {
  const list = deriveEncounterToastsFromNewLogSlice(events, stateAfter, viewerInput)
  return list[0] ?? null
}
