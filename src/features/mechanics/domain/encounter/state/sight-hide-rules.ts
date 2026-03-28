import { getCellForCombatant } from '@/features/encounter/space'
import { resolveWorldEnvironmentFromEncounterState } from '@/features/mechanics/domain/encounter/environment/environment.resolve'
import type { EncounterWorldCellEnvironment } from '@/features/mechanics/domain/encounter/environment/environment.types'

import { canPerceiveTargetOccupantForCombat } from './combatant-pair-visibility'
import type { EncounterState } from './types'
import type { EncounterViewerPerceptionCapabilities } from '../environment/perception.types'

/**
 * Whether the observer can **visually perceive the subject’s occupant** for rules that care about sight
 * (sight-based checks, stealth vs observer, narrative gating). Same implementation as attack/targeting/OA:
 * {@link canPerceiveTargetOccupantForCombat}.
 *
 * **Missing tactical data:** follows that helper’s permissive occupant fallback after condition/LOS gates.
 */
export function canVisuallyPerceiveSubjectForRules(
  state: EncounterState,
  observerId: string,
  subjectId: string,
  options?: { capabilities?: EncounterViewerPerceptionCapabilities },
): boolean {
  return canPerceiveTargetOccupantForCombat(state, observerId, subjectId, options)
}

export type SightBasedCheckDenialReason = 'cannot-perceive-subject'

/**
 * Sight-dependent ability/skill checks: if the observer cannot perceive the subject occupant, the check
 * cannot proceed on sight alone (engine: **blocked** with a kebab-case reason).
 *
 * Callers that need “automatic fail” vs “blocked before roll” can map `cannot-perceive-subject` accordingly.
 */
export function getSightBasedCheckLegalityDenialReason(
  state: EncounterState,
  observerId: string,
  subjectId: string,
  options?: { capabilities?: EncounterViewerPerceptionCapabilities },
): SightBasedCheckDenialReason | null {
  if (!canVisuallyPerceiveSubjectForRules(state, observerId, subjectId, options)) {
    return 'cannot-perceive-subject'
  }
  return null
}

/**
 * World-only: does this cell provide **concealment** sufficient to attempt a Hide action (dim/darkness,
 * light/heavy obscurement, or magical darkness), independent of any viewer?
 *
 * Uses merged {@link EncounterWorldCellEnvironment} — not render/UI state.
 */
export function cellWorldSupportsHideConcealment(world: EncounterWorldCellEnvironment): boolean {
  if (world.visibilityObscured === 'light' || world.visibilityObscured === 'heavy') return true
  if (world.lightingLevel === 'dim' || world.lightingLevel === 'darkness') return true
  if (world.magicalDarkness) return true
  return false
}

/**
 * **Baseline (this pass):** half cover does **not** count toward hide by itself; **three-quarters** or
 * **full** (total) cover on the merged world cell does. Cell-local grade from `terrainCover`, not
 * observer-relative line-of-sight cover.
 *
 * @see cellWorldSupportsHideAttemptWorldBasis — combines concealment + cover + optional feature flags.
 */
export function cellTerrainCoverSupportsHideBaseline(world: EncounterWorldCellEnvironment): boolean {
  const g = world.terrainCover
  return g === 'three-quarters' || g === 'full'
}

/**
 * Optional hooks for future feat/subclass/magic rules. **Omit** or leave flags unset for baseline behavior.
 *
 * **Not implemented here** (reserved fields / docs only until wired from combatant state):
 * dim-light-only hide, Skulker-style light obscurement, magical concealment grants — add predicates
 * in one place when those features exist.
 */
export type HideEligibilityFeatureFlags = {
  /**
   * When true, treat **half** cover as sufficient for hide eligibility (baseline requires three-quarters
   * or full). Intended for future feat/class wiring from runtime combatant state.
   */
  allowHalfCoverForHide?: boolean
}

export type HideEligibilityExtensionOptions = {
  featureFlags?: HideEligibilityFeatureFlags
}

/**
 * Single rules-layer gate: does merged **world** state at the hider’s cell support attempting Hide
 * (concealment **or** baseline-sufficient cover **or** explicit extension flags)?
 *
 * Does **not** replace occupant perception — {@link getHideAttemptEligibilityDenialReason} still pairs
 * this with `canPerceiveTargetOccupantForCombat`.
 */
export function cellWorldSupportsHideAttemptWorldBasis(
  world: EncounterWorldCellEnvironment,
  hideEligibility?: HideEligibilityExtensionOptions,
): boolean {
  if (cellWorldSupportsHideConcealment(world)) return true
  if (cellTerrainCoverSupportsHideBaseline(world)) return true
  if (hideEligibility?.featureFlags?.allowHalfCoverForHide === true && world.terrainCover === 'half') {
    return true
  }
  return false
}

export type HideAttemptEligibilityDenialReason =
  | 'self'
  | 'missing-hider-placement'
  | 'observer-sees-without-concealment'

export type GetHideAttemptEligibilityDenialReasonOptions = {
  capabilities?: EncounterViewerPerceptionCapabilities
  hideEligibility?: HideEligibilityExtensionOptions
}

/**
 * Narrow Hide **attempt** eligibility (not a full Stealth contest): whether `hiderId` may attempt to hide
 * from `observerId` using the same **occupant** perception seam plus **world** support for hide
 * (concealment and/or sufficient terrain cover — see {@link cellWorldSupportsHideAttemptWorldBasis}).
 *
 * - If the observer **can** perceive the hider’s **occupant** (`canPerceiveTargetOccupantForCombat`) **and**
 *   the hider’s cell has **no** concealment or sufficient cover (bright, clear, no / insufficient cover),
 *   hiding in plain sight is denied.
 * - If the observer **cannot** perceive the occupant (heavy obscurement, magical darkness, invisibility, etc.),
 *   the attempt is allowed from a sight perspective.
 * - If the observer **can** perceive the occupant **but** the cell supports hide (e.g. dim, light obscured,
 *   three-quarters cover), a Hide attempt is allowed. **Resolution** vs passive Perception is handled in
 *   `stealth-rules.ts` / `resolveHideWithPassivePerception` after the Stealth total is rolled (not here).
 *
 * **Missing tactical grid / hider placement:** permissive — returns `null` (allow attempt) so behavior
 * matches the pair-visibility fallback when geometry is absent.
 */
export function getHideAttemptEligibilityDenialReason(
  state: EncounterState,
  hiderId: string,
  observerId: string,
  options?: GetHideAttemptEligibilityDenialReasonOptions,
): HideAttemptEligibilityDenialReason | null {
  if (hiderId === observerId) return 'self'

  if (!state.space || !state.placements) {
    return null
  }

  const hiderCell = getCellForCombatant(state.placements, hiderId)
  if (!hiderCell) {
    return 'missing-hider-placement'
  }

  const world = resolveWorldEnvironmentFromEncounterState(state, hiderCell)
  const hasWorldHideBasis =
    world != null && cellWorldSupportsHideAttemptWorldBasis(world, options?.hideEligibility)

  const observerSeesOccupant = canPerceiveTargetOccupantForCombat(state, observerId, hiderId, options)

  if (observerSeesOccupant && !hasWorldHideBasis) {
    return 'observer-sees-without-concealment'
  }

  return null
}
