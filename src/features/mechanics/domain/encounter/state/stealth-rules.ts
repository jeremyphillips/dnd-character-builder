/**
 * Single owner for stealth / hidden-from-observer **rules and mutations**. Other modules call these
 * exports; do not duplicate stealth logic elsewhere.
 *
 * **Boundary:** Perception (`canPerceiveTargetOccupantForCombat`, `canSeeForTargeting`, pair visibility
 * for attacks) answers whether an observer can **see** a subject. `CombatantStealthRuntime` records
 * observer-relative stealth on top of that seam — stealth is **not** a second sight engine.
 *
 * **Reconciliation** helpers keep stored `hiddenFromObserverIds` aligned when visibility/concealment
 * changes so stealth does not become a divergent truth source.
 */

import { getCellForCombatant } from '@/features/encounter/space'
import { resolveWorldEnvironmentFromEncounterState } from '@/features/mechanics/domain/encounter/environment/environment.resolve'

import { canPerceiveTargetOccupantForCombat } from './combatant-pair-visibility'
import { updateEncounterCombatant } from './mutations'
import {
  cellWorldSupportsHideConcealment,
  getHideAttemptEligibilityDenialReason,
  type HideAttemptEligibilityDenialReason,
} from './sight-hide-rules'
import type { CombatantStealthRuntime } from './types/combatant.types'
import type { EncounterState } from './types'
import type { EncounterViewerPerceptionCapabilities } from '../environment/perception.types'

export type StealthRulesOptions = {
  perceptionCapabilities?: EncounterViewerPerceptionCapabilities
}

function perceptionOpts(options?: StealthRulesOptions): { capabilities?: EncounterViewerPerceptionCapabilities } | undefined {
  return options?.perceptionCapabilities != null ? { capabilities: options.perceptionCapabilities } : undefined
}

/**
 * Hide **attempt** eligibility only (can you try to hide from this observer). Delegates to
 * {@link getHideAttemptEligibilityDenialReason} — same world + occupant seam as before this module existed.
 */
export function getStealthHideAttemptDenialReason(
  state: EncounterState,
  hiderId: string,
  observerId: string,
  options?: StealthRulesOptions,
): HideAttemptEligibilityDenialReason | null {
  return getHideAttemptEligibilityDenialReason(state, hiderId, observerId, perceptionOpts(options))
}

/**
 * Records runtime hidden state **after** the caller has already determined a successful hide outcome.
 *
 * This is **not** opposed Stealth vs passive Perception — those are not implemented yet. The explicit
 * `observerIds` parameter is the seam for a future contest resolver to pass “who you beat / who you are
 * hidden from.” Callers may instead use {@link resolveDefaultHideObservers} for a non-contested default.
 */
export function applyStealthHideSuccess(
  state: EncounterState,
  hiderId: string,
  observerIds: string[],
): EncounterState {
  const unique = [...new Set(observerIds)].filter((id) => id !== hiderId)
  if (unique.length === 0) return state

  return updateEncounterCombatant(state, hiderId, (c) => {
    const prev = c.stealth?.hiddenFromObserverIds ?? []
    const merged = [...new Set([...prev, ...unique])]
    const next: CombatantStealthRuntime = {
      ...c.stealth,
      hiddenFromObserverIds: merged,
    }
    return { ...c, stealth: next }
  })
}

/**
 * Non-contested default: other-side combatants for whom hide attempt eligibility passes (delegates to
 * {@link getStealthHideAttemptDenialReason} === null). Not a full observer-set contest.
 */
export function resolveDefaultHideObservers(
  state: EncounterState,
  hiderId: string,
  options?: StealthRulesOptions,
): string[] {
  const hider = state.combatantsById[hiderId]
  if (!hider) return []
  const candidateIds = hider.side === 'party' ? state.enemyCombatantIds : state.partyCombatantIds
  return candidateIds.filter((oid) => {
    if (oid === hiderId) return false
    return getStealthHideAttemptDenialReason(state, hiderId, oid, options) === null
  })
}

/**
 * **Reconciliation:** remove observer ids from each subject’s `hiddenFromObserverIds` when that
 * observer **can** now perceive the subject’s occupant — keeps stealth aligned with the shared
 * perception seam.
 */
export function reconcileStealthHiddenForPerceivedObservers(
  state: EncounterState,
  options?: StealthRulesOptions,
): EncounterState {
  const cap = perceptionOpts(options)
  let next = state

  for (const combatant of Object.values(state.combatantsById)) {
    const stealth = combatant.stealth
    if (!stealth?.hiddenFromObserverIds?.length) continue

    const filtered = stealth.hiddenFromObserverIds.filter(
      (observerId) => !canPerceiveTargetOccupantForCombat(next, observerId, combatant.instanceId, cap),
    )

    if (filtered.length === stealth.hiddenFromObserverIds.length) continue

    next = updateEncounterCombatant(next, combatant.instanceId, (c) => ({
      ...c,
      stealth:
        filtered.length === 0
          ? undefined
          : {
              ...c.stealth,
              hiddenFromObserverIds: filtered,
            },
    }))
  }

  return next
}

/**
 * **Reconciliation:** if the hider’s cell no longer supports hide concealment (merged world), clear
 * stealth — leaving cover/obscurity that enabled hiding is treated as ending hidden state for this pass.
 *
 * Primary grid move path: `useEncounterState` `handleMoveCombatant` (after `moveCombatant`). Other
 * placement/mutation paths that change cell without going through that hook should call this (or full
 * stealth reconciliation) or hidden state may drift — see docs/reference/stealth.md.
 */
export function reconcileStealthBreakWhenNoConcealmentInCell(
  state: EncounterState,
  hiderId: string,
): EncounterState {
  if (!state.space || !state.placements) return state
  const cellId = getCellForCombatant(state.placements, hiderId)
  if (!cellId) return state
  const world = resolveWorldEnvironmentFromEncounterState(state, cellId)
  if (world == null) return state
  if (cellWorldSupportsHideConcealment(world)) return state
  return clearStealthForCombatant(state, hiderId)
}

function clearStealthForCombatant(state: EncounterState, combatantId: string): EncounterState {
  const c = state.combatantsById[combatantId]
  if (c == null || c.stealth == null) return state
  return updateEncounterCombatant(state, combatantId, ({ stealth: _s, ...rest }) => rest)
}

/**
 * **Baseline simplification (current pass):** clear the attacker’s stealth when they **make** an attack.
 * May later be refined (partial reveals per observer, features, “location revealed” only, spells).
 */
export function breakStealthOnAttack(state: EncounterState, attackerId: string): EncounterState {
  return clearStealthForCombatant(state, attackerId)
}

/** Whether `subjectId` is currently marked hidden from `observerId` (runtime bookkeeping only). */
export function isHiddenFromObserver(state: EncounterState, observerId: string, subjectId: string): boolean {
  return state.combatantsById[subjectId]?.stealth?.hiddenFromObserverIds.includes(observerId) ?? false
}
