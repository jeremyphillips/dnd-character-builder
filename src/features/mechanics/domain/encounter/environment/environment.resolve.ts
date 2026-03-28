import type {
  EncounterAtmosphereTag,
  EncounterCellEnvironmentResolved,
  EncounterEnvironmentAreaLink,
  EncounterEnvironmentBaseline,
  EncounterEnvironmentZoneOverride,
} from './environment.types'

export const DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE: EncounterEnvironmentBaseline = {
  setting: 'outdoors',
  lightingLevel: 'bright',
  terrainMovement: 'normal',
  visibilityObscured: 'none',
  atmosphereTags: [],
}

export function cellIdInEnvironmentAreaLink(
  area: EncounterEnvironmentAreaLink,
  cellId: string,
): boolean {
  switch (area.kind) {
    case 'grid-cell-ids':
      return area.cellIds.includes(cellId)
    case 'grid-cell-radius':
      // Phase 1+: resolve with grid geometry / neighbor lookup.
      return false
    case 'unattached':
      return false
  }
}

function mergeAtmosphereForZones(
  baseline: EncounterAtmosphereTag[],
  applicableZones: EncounterEnvironmentZoneOverride[],
): EncounterAtmosphereTag[] {
  let tags = [...baseline]
  for (const z of applicableZones) {
    const o = z.overrides
    if (o.atmosphereTagsReplace !== undefined) {
      tags = [...o.atmosphereTagsReplace]
    }
    if (o.atmosphereTagsRemove?.length) {
      const remove = new Set(o.atmosphereTagsRemove)
      tags = tags.filter((t) => !remove.has(t))
    }
    if (o.atmosphereTagsAdd?.length) {
      tags = [...new Set([...tags, ...o.atmosphereTagsAdd])]
    }
  }
  return tags
}

/**
 * Resolve per-cell environment: baseline plus ordered zone overrides.
 * Scalar fields: last applicable zone wins. Zones are filtered to those covering `cellId`.
 */
export function resolveCellEnvironment(
  baseline: EncounterEnvironmentBaseline,
  zones: EncounterEnvironmentZoneOverride[],
  cellId: string,
): EncounterCellEnvironmentResolved {
  const applicable = zones.filter((z) => cellIdInEnvironmentAreaLink(z.area, cellId))

  let lightingLevel = baseline.lightingLevel
  let terrainMovement = baseline.terrainMovement
  let visibilityObscured = baseline.visibilityObscured
  const appliedZoneIds: string[] = []

  for (const z of applicable) {
    appliedZoneIds.push(z.id)
    const o = z.overrides
    if (o.lightingLevel !== undefined) lightingLevel = o.lightingLevel
    if (o.terrainMovement !== undefined) terrainMovement = o.terrainMovement
    if (o.visibilityObscured !== undefined) visibilityObscured = o.visibilityObscured
  }

  const atmosphereTags = mergeAtmosphereForZones(baseline.atmosphereTags, applicable)

  return {
    lightingLevel,
    terrainMovement,
    visibilityObscured,
    atmosphereTags,
    appliedZoneIds,
  }
}
