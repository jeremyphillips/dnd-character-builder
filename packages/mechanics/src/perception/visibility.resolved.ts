/**
 * **Semantic cell visibility** — single resolver for presentation-oriented “what wins” at a cell after merge.
 *
 * Inputs are {@link EncounterWorldCellEnvironment} (already merged; includes `obscurationPresentationCauses`
 * when available) plus {@link VisibilityContributor}s from {@link buildVisibilityContributors}. This module does
 * **not** apply compatibility inference for missing causes; callers use `visibility.presentation` for the full
 * stack, or run {@link inferObscurationPresentationCausesWhenMissing} first when needed.
 *
 * **Not** render fills — use {@link mapResolvedVisibilityToFillKind} after {@link resolveCellVisibility}.
 */

import type {
  EncounterWorldCellEnvironment,
  WorldObscurationPresentationCause,
} from '../environment/environment.types'
import type { ResolvedCellVisibility, VisibilityContributor, VisibilityPrimaryCause } from './visibility.types'

/** Lower index = lower presentation precedence; higher index wins for {@link pickPrimaryObscurationCause}. */
const PRIMARY_CAUSE_RANK: Record<WorldObscurationPresentationCause, number> = {
  environment: 0,
  dust: 1,
  smoke: 2,
  fog: 3,
  darkness: 4,
  'magical-darkness': 5,
}

/**
 * Picks the winning obscuration cause for presentation (deterministic).
 * Precedence: magical darkness > darkness > fog > smoke > dust > environment.
 */
export function pickPrimaryObscurationCause(
  causes: readonly WorldObscurationPresentationCause[],
): VisibilityPrimaryCause | undefined {
  if (causes.length === 0) return undefined
  let best: WorldObscurationPresentationCause | undefined
  let bestRank = -1
  for (const c of causes) {
    const r = PRIMARY_CAUSE_RANK[c]
    if (r > bestRank) {
      bestRank = r
      best = c
    }
  }
  return best
}

/**
 * Pure semantic visibility from merged world + contributor list (hidden comes from perception packaging).
 */
export function resolveCellVisibility(params: {
  world: EncounterWorldCellEnvironment
  contributors: VisibilityContributor[]
}): ResolvedCellVisibility {
  const hidden = params.contributors.some((c) => c.kind === 'hidden')
  const { lightingLevel, visibilityObscured } = params.world
  if (hidden) {
    return {
      lighting: lightingLevel,
      obscured: visibilityObscured,
      primaryCause: 'unrevealed',
      hidden: true,
    }
  }
  const primaryCause = pickPrimaryObscurationCause(params.world.obscurationPresentationCauses)
  return {
    lighting: lightingLevel,
    obscured: visibilityObscured,
    primaryCause,
    hidden: false,
  }
}
