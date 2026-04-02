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
 * 5. **Presentation mapping** — {@link mapResolvedVisibilityToFillKind} (**only** place: resolved → fill). For
 *    unrevealed cells (`hidden`), optional **viewer** merged world (see
 *    `viewerMergedWorldForImmersedHiddenPresentation`) tints fog/MD/etc. instead of generic `hidden` when
 *    immersion should read as one obscuration.
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
import { pickPrimaryObscurationCause, resolveCellVisibility } from './visibility.resolved'
import type { ResolvedCellVisibility, VisibilityFillKind } from './visibility.types'

/**
 * Viewer-relative presentation copy when darkvision mitigates ordinary environmental darkness.
 * Does **not** mutate encounter merged world; shallow copy only.
 *
 * **Blindsight:** when {@link EncounterViewerPerceptionCell.perceivedByBlindsight} is true, strip concealment
 * that sight-based presentation would show (darkness, fog, magical darkness) — rules layer already marked the
 * cell as fully perceivable within blindsight range.
 */
export function buildViewerAdjustedPresentationWorld(
  mergedWorld: EncounterWorldCellEnvironment,
  perception: EncounterViewerPerceptionCell,
): EncounterWorldCellEnvironment {
  if (perception.perceivedByBlindsight) {
    return {
      ...mergedWorld,
      lightingLevel: 'bright',
      visibilityObscured: 'none',
      magicalDarkness: false,
      blocksDarkvision: false,
      obscurationPresentationCauses: [],
    }
  }
  if (!perception.environmentalDarknessMitigatedByDarkvision) return mergedWorld
  return {
    ...mergedWorld,
    lightingLevel: 'dim',
    obscurationPresentationCauses: mergedWorld.obscurationPresentationCauses.filter((c) => c !== 'darkness'),
  }
}

/**
 * Builds a **presentation-only** non-`hidden` resolved snapshot from the viewer’s merged world so
 * {@link mapNonHiddenResolvedVisibilityToFillKind} can yield fog / darkness / magical-darkness tints.
 * Does **not** participate in combat visibility rules — target semantics are already in `resolved`.
 */
function resolvedFromViewerWorldForPresentation(world: EncounterWorldCellEnvironment): ResolvedCellVisibility {
  return {
    lighting: world.lightingLevel,
    obscured: world.visibilityObscured,
    primaryCause: pickPrimaryObscurationCause(world.obscurationPresentationCauses),
    hidden: false,
  }
}

/**
 * Semantic `ResolvedCellVisibility` → grid tint when **not** unrevealed-hidden (see {@link mapResolvedVisibilityToFillKind}).
 */
export function mapNonHiddenResolvedVisibilityToFillKind(
  resolved: ResolvedCellVisibility,
): VisibilityFillKind | null {
  const { primaryCause, obscured } = resolved

  if (primaryCause === 'magical-darkness') return 'magical-darkness'
  if (primaryCause === 'darkness') return 'darkness'
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
 * Semantic `ResolvedCellVisibility` → grid tint id. **Presentation only** — no combat rules.
 *
 * ## Hidden cells (`resolved.hidden` — perception `canPerceiveCell: false`)
 *
 * Target-cell visibility is **already** decided by {@link resolveCellVisibility} from the **target** merged
 * world + perception. This function does not re-run or override that.
 *
 * **Immersed obscuration continuity:** For hidden cells, if the viewer is immersed in a **concrete** obscuring
 * environment (fog, darkness, magical darkness, …), prefer that environment’s **presentation** fill over
 * generic `hidden`, so the grid does not show a hard edge between “in-volume” tints and generic black veil
 * cells when the lack of perception is the same obscuration from the viewer’s perspective.
 *
 * **`viewerMergedWorldForImmersedHiddenPresentation`** exists **only** for that immersed hidden **fill**
 * choice. It is **not** used to recompute whether the target cell is hidden, line-of-sight, or any other
 * target-relative visibility — pass the merged environment at the **viewer’s** cell from encounter state as
 * given; do not substitute target world or re-infer causes using target perception as if it were the viewer.
 *
 * When this argument is omitted, or it yields no mappable tint via
 * {@link mapNonHiddenResolvedVisibilityToFillKind}, the fill is **`hidden`** (true unrevealed / unknown, or no
 * obscuration presentation to mirror).
 *
 * @param resolved — Output of {@link resolveCellVisibility} for the **target** cell.
 * @param viewerMergedWorldForImmersedHiddenPresentation — Optional merged world at the **viewer’s** cell; used
 *   **only** when `resolved.hidden` is true, to pick fog / darkness / magical-darkness (etc.) instead of
 *   generic `hidden`. Ignored when `resolved.hidden` is false.
 */
export function mapResolvedVisibilityToFillKind(
  resolved: ResolvedCellVisibility,
  viewerMergedWorldForImmersedHiddenPresentation?: EncounterWorldCellEnvironment | null,
): VisibilityFillKind | null {
  if (resolved.hidden) {
    if (viewerMergedWorldForImmersedHiddenPresentation) {
      const fromViewer = mapNonHiddenResolvedVisibilityToFillKind(
        resolvedFromViewerWorldForPresentation(viewerMergedWorldForImmersedHiddenPresentation),
      )
      if (fromViewer !== null) return fromViewer
    }
    return 'hidden'
  }
  return mapNonHiddenResolvedVisibilityToFillKind(resolved)
}

/**
 * Canonical presentation pipeline when `world` already includes any inferred or merged
 * `obscurationPresentationCauses` — **does not** run {@link inferObscurationPresentationCausesWhenMissing}.
 */
export function resolvePresentationVisibilityFillFromMergedWorld(
  perception: EncounterViewerPerceptionCell,
  world: EncounterWorldCellEnvironment,
  /**
   * Merged environment at the **viewer’s** cell (from encounter merge). Forwarded to
   * {@link mapResolvedVisibilityToFillKind} as `viewerMergedWorldForImmersedHiddenPresentation` **only** to
   * choose immersed hidden **presentation** tints — it does **not** change target-cell visibility resolution
   * above (still `world` + `perception` for the target).
   */
  viewerWorld?: EncounterWorldCellEnvironment | null,
): VisibilityFillKind | null {
  const worldForPresentation = buildViewerAdjustedPresentationWorld(world, perception)
  const contributors = buildVisibilityContributors({ targetWorld: worldForPresentation, perception })
  const resolved = resolveCellVisibility({ world: worldForPresentation, contributors })
  return mapResolvedVisibilityToFillKind(resolved, viewerWorld)
}

/**
 * Production entry: target world from encounter merge + viewer perception → presentation fill.
 * Applies compatibility inference for empty causes, then {@link resolvePresentationVisibilityFillFromMergedWorld}.
 */
export function resolvePresentationVisibilityFill(
  perception: EncounterViewerPerceptionCell,
  targetWorld: EncounterWorldCellEnvironment,
  /**
   * Merged viewer cell world from encounter state. Used only for immersed hidden **fill** parity (see
   * {@link mapResolvedVisibilityToFillKind}); **not** for recomputing target visibility. Do not re-infer this
   * with target perception — obscuration causes here are viewer-local.
   */
  viewerWorld?: EncounterWorldCellEnvironment | null,
): VisibilityFillKind | null {
  const world = inferObscurationPresentationCausesWhenMissing(targetWorld, perception)
  return resolvePresentationVisibilityFillFromMergedWorld(perception, world, viewerWorld)
}
