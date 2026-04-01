/**
 * Builds {@link VisibilityContributor}s from merged world + **combat** perception for the target cell.
 * Separates **lighting** (environment axis) from **obscuration causes** (world merge metadata). Does not
 * decide grid tints — {@link resolveCellVisibility} + {@link mapResolvedVisibilityToFillKind} do.
 */

import type { EncounterWorldCellEnvironment, ObscuredLevel, WorldObscurationPresentationCause } from '../environment/environment.types'

import type { EncounterViewerPerceptionCell } from './perception.types'
import type { VisibilityContributor } from './visibility.types'

function obscurationLevelForCause(
  world: EncounterWorldCellEnvironment,
  cause: WorldObscurationPresentationCause,
): Exclude<ObscuredLevel, 'none'> | undefined {
  if (world.visibilityObscured !== 'none') {
    return world.visibilityObscured === 'light' ? 'light' : 'heavy'
  }
  if (cause === 'darkness' || cause === 'magical-darkness') {
    return 'heavy'
  }
  return undefined
}

/**
 * Builds visibility contributors from merged world state and stable combat perception for the target cell.
 * Does not change combat rules — only packages inputs for {@link resolveCellVisibility}.
 */
export function buildVisibilityContributors(params: {
  targetWorld: EncounterWorldCellEnvironment
  perception: EncounterViewerPerceptionCell
}): VisibilityContributor[] {
  const { targetWorld, perception } = params
  const out: VisibilityContributor[] = []
  out.push({ kind: 'lighting', level: targetWorld.lightingLevel, source: 'environment' })
  if (!perception.canPerceiveCell) {
    out.push({ kind: 'hidden', cause: 'unrevealed' })
  }
  for (const cause of targetWorld.obscurationPresentationCauses) {
    const level = obscurationLevelForCause(targetWorld, cause)
    if (level === undefined) continue
    out.push({ kind: 'obscuration', level, cause })
  }
  return out
}
