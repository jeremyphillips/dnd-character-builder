import type {
  CombatantHideEligibilityExtension,
  CombatantInstance,
} from './types/combatant.types'

function hasAnyHideEligibilityFeatureFlags(
  flags: CombatantHideEligibilityExtension['featureFlags'] | undefined,
): boolean {
  if (flags == null) return false
  return flags.allowHalfCoverForHide === true
}

/**
 * Derives hide-extension options from the combatant’s **runtime** stat snapshot (`stats.skillRuntime`).
 * Single seam for feat/trait-driven hide rules; entry and sustain both consume the output via
 * {@link resolveHideEligibilityForCombatant} in `sight-hide-rules.ts`.
 *
 * **Source of truth (this pass):** `skillRuntime.hideEligibilityFeatureFlags` set at combatant build time.
 * **TODO:** merge in effect/marker-driven grants when those paths exist.
 */
export function getCombatantHideEligibilityExtensionOptions(
  combatant: CombatantInstance,
): CombatantHideEligibilityExtension | undefined {
  const flags = combatant.stats.skillRuntime?.hideEligibilityFeatureFlags
  if (flags == null || !hasAnyHideEligibilityFeatureFlags(flags)) return undefined
  return { featureFlags: { ...flags } }
}
