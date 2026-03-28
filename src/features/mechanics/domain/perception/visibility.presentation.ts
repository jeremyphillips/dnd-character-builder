/**
 * **Grid visibility presentation** — semantic resolution → UI tint ids (`VisibilityFillKind`).
 *
 * ## Canonical pipeline (preferred)
 *
 * 1. **Merged world** — `EncounterWorldCellEnvironment` from `resolveWorldEnvironmentFromEncounterState` /
 *    `resolveWorldEnvironmentForCell` (baseline + zones; includes `obscurationPresentationCauses` when merge ran).
 * 2. **Compatibility layer (only if needed)** — {@link inferObscurationPresentationCausesWhenMissing} when
 *    causes are empty (hand-built / legacy data). See that module’s JSDoc; it is **not** a second semantic model.
 * 3. **Contributors** — {@link buildVisibilityContributors} (packages lighting + obscuration + hidden for resolution).
 * 4. **Semantic resolution** — {@link resolveCellVisibility} (lighting vs obscuration cause precedence; `hidden`).
 * 5. **Presentation mapping** — {@link mapResolvedVisibilityToFillKind} (**only** place: resolved → fill).
 *
 * Entry points:
 * - **`resolvePresentationVisibilityFill`** — perception + target world → fill (production); runs compatibility
 *   then the canonical chain.
 * - **`resolvePresentationVisibilityFillFromMergedWorld`** — same chain **without** compatibility inference;
 *   use when callers already merged causes (tests, tools); same internal steps as production after step 2.
 *
 * **Do not** map `maskedByDarkness` or raw world booleans directly to fills in the renderer — combat perception
 * stays in {@link resolveViewerPerceptionForCell}; presentation consumes this pipeline only.
 */

import type { EncounterViewerPerceptionCell } from './perception.types'
import type { EncounterWorldCellEnvironment } from '../environment/environment.types'
import { buildVisibilityContributors } from './visibility.contributors'
import { inferObscurationPresentationCausesWhenMissing } from './visibility.presentation.compatibility'
import { resolveCellVisibility } from './visibility.resolved'
import type { ResolvedCellVisibility, VisibilityFillKind } from './visibility.types'

/**
 * Semantic `ResolvedCellVisibility` → grid tint id. **Presentation only** — no combat rules.
 *
 * Distinct from {@link resolveCellVisibility}: that type holds **meaning** (lighting, obscured grade, winning
 * cause); this function picks **which CSS/visual bucket** to use. Lighting vs obscuration distinction is
 * resolved before this step.
 */
export function mapResolvedVisibilityToFillKind(resolved: ResolvedCellVisibility): VisibilityFillKind | null {
  if (resolved.hidden) return 'hidden'

  const { primaryCause, obscured } = resolved

  if (primaryCause === 'magical-darkness') return 'magical-darkness'
  if (primaryCause === 'darkness') return 'darkness'
  // `fog` fill: shared smoky tint for fog cause and (for now) smoke/dust — see VisibilityFillKind / AttachedEnvironmentZoneProfile 'fog'.
  if (primaryCause === 'fog' || primaryCause === 'smoke' || primaryCause === 'dust') return 'fog'
  if (primaryCause === 'environment') {
    if (obscured === 'heavy') return 'darkness'
    if (obscured === 'light') return 'dim'
    return null
  }

  if (primaryCause === undefined) {
    if (obscured === 'light') return 'dim'
    if (obscured === 'heavy') return 'darkness'
    return null
  }

  return null
}

/**
 * Canonical presentation pipeline when `world` already includes any inferred or merged
 * `obscurationPresentationCauses` — **does not** run {@link inferObscurationPresentationCausesWhenMissing}.
 */
export function resolvePresentationVisibilityFillFromMergedWorld(
  perception: EncounterViewerPerceptionCell,
  world: EncounterWorldCellEnvironment,
): VisibilityFillKind | null {
  const contributors = buildVisibilityContributors({ targetWorld: world, perception })
  const resolved = resolveCellVisibility({ world, contributors })
  return mapResolvedVisibilityToFillKind(resolved)
}

/**
 * Production entry: target world from encounter merge + viewer perception → presentation fill.
 * Applies compatibility inference for empty causes, then {@link resolvePresentationVisibilityFillFromMergedWorld}.
 */
export function resolvePresentationVisibilityFill(
  perception: EncounterViewerPerceptionCell,
  targetWorld: EncounterWorldCellEnvironment,
): VisibilityFillKind | null {
  const world = inferObscurationPresentationCausesWhenMissing(targetWorld, perception)
  return resolvePresentationVisibilityFillFromMergedWorld(perception, world)
}
