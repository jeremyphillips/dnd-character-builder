import type { Effect } from '../../effects/effects.types'
import type {
  CombatantHideEligibilityFeatureFlagsRuntime,
  RuntimeMarker,
} from './types/combatant.types'

/**
 * Marker **`id`** or **`classification`** entry that OR-merges **`allowHalfCoverForHide`** with snapshot
 * and `hide-eligibility-grant` effects. Prefer stable ids over free-form labels.
 */
export const RUNTIME_MARKER_HIDE_ELIGIBILITY_ALLOW_HALF_COVER_ID = 'hide-eligibility:allow-half-cover'

/**
 * Boolean hide-eligibility flags combine with **union (OR)** semantics across:
 * - `stats.skillRuntime.hideEligibilityFeatureFlags` (authored / builder snapshot)
 * - `activeEffects` (including nested payloads — auras, state `ongoingEffects`, etc.)
 * - `conditions` and `states` runtime markers (see `RUNTIME_MARKER_*` constants)
 *
 * If any source sets `allowHalfCoverForHide: true`, the merged result is true.
 */
export function mergeHideEligibilityFeatureFlagsOr(
  ...parts: (CombatantHideEligibilityFeatureFlagsRuntime | undefined | null)[]
): CombatantHideEligibilityFeatureFlagsRuntime | undefined {
  const merged: CombatantHideEligibilityFeatureFlagsRuntime = {}
  for (const p of parts) {
    if (!p) continue
    if (p.allowHalfCoverForHide === true) merged.allowHalfCoverForHide = true
  }
  if (!hasAnyHideEligibilityFeatureFlags(merged)) return undefined
  return merged
}

export function hasAnyHideEligibilityFeatureFlags(
  flags: CombatantHideEligibilityFeatureFlagsRuntime | undefined,
): boolean {
  if (flags == null) return false
  return flags.allowHalfCoverForHide === true
}

/** Depth-first walk: roots plus nested effects that can carry mechanical payloads on the stack. */
function visitEffectsForFlattening(effect: Effect, out: Effect[]): void {
  out.push(effect)
  switch (effect.kind) {
    case 'trigger':
      effect.effects.forEach((e) => visitEffectsForFlattening(e, out))
      break
    case 'save':
      effect.onFail.forEach((e) => visitEffectsForFlattening(e, out))
      effect.onSuccess?.forEach((e) => visitEffectsForFlattening(e, out))
      break
    case 'check':
      effect.onSuccess?.forEach((e) => visitEffectsForFlattening(e, out))
      effect.onFail?.forEach((e) => visitEffectsForFlattening(e, out))
      break
    case 'activation':
      effect.effects.forEach((e) => visitEffectsForFlattening(e, out))
      break
    case 'state':
      effect.ongoingEffects?.forEach((e) => visitEffectsForFlattening(e, out))
      break
    case 'aura':
      effect.effects.forEach((e) => visitEffectsForFlattening(e, out))
      break
    case 'interval':
      effect.effects.forEach((e) => visitEffectsForFlattening(e, out))
      break
    default:
      break
  }
}

export function flattenActiveEffectsTree(rootEffects: Effect[]): Effect[] {
  const out: Effect[] = []
  rootEffects.forEach((e) => visitEffectsForFlattening(e, out))
  return out
}

export function extractHideEligibilityFeatureFlagsFromEffects(
  flatEffects: Effect[],
): CombatantHideEligibilityFeatureFlagsRuntime {
  const merged: CombatantHideEligibilityFeatureFlagsRuntime = {}
  for (const e of flatEffects) {
    if (e.kind === 'hide-eligibility-grant' && e.featureFlags.allowHalfCoverForHide === true) {
      merged.allowHalfCoverForHide = true
    }
  }
  return merged
}

export function extractHideEligibilityFeatureFlagsFromRuntimeMarkers(
  markers: RuntimeMarker[],
): CombatantHideEligibilityFeatureFlagsRuntime {
  const merged: CombatantHideEligibilityFeatureFlagsRuntime = {}
  const tag = RUNTIME_MARKER_HIDE_ELIGIBILITY_ALLOW_HALF_COVER_ID
  for (const m of markers) {
    if (m.id === tag || m.classification?.includes(tag)) {
      merged.allowHalfCoverForHide = true
    }
  }
  return merged
}

export function resolveTemporaryHideEligibilityFeatureFlagsFromCombatantRuntime(args: {
  activeEffects: Effect[]
  conditions: RuntimeMarker[]
  states: RuntimeMarker[]
}): CombatantHideEligibilityFeatureFlagsRuntime | undefined {
  const flat = flattenActiveEffectsTree(args.activeEffects)
  const fromEffects = extractHideEligibilityFeatureFlagsFromEffects(flat)
  const fromConditions = extractHideEligibilityFeatureFlagsFromRuntimeMarkers(args.conditions)
  const fromStates = extractHideEligibilityFeatureFlagsFromRuntimeMarkers(args.states)
  return mergeHideEligibilityFeatureFlagsOr(fromEffects, fromConditions, fromStates)
}
