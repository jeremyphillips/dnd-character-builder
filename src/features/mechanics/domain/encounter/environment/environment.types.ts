import {
  ATMOSPHERE_TAGS,
  ENVIRONMENT_SETTINGS,
  LIGHTING_LEVELS,
  TERRAIN_MOVEMENT_TYPES,
  VISIBILITY_OBSCURED_LEVELS,
} from './environment.constants'

export type EncounterEnvironmentSetting = (typeof ENVIRONMENT_SETTINGS)[number]['id']
export type EncounterLightingLevel = (typeof LIGHTING_LEVELS)[number]['id']
export type EncounterTerrainMovement = (typeof TERRAIN_MOVEMENT_TYPES)[number]['id']
export type EncounterVisibilityObscured = (typeof VISIBILITY_OBSCURED_LEVELS)[number]['id']
export type EncounterAtmosphereTag = (typeof ATMOSPHERE_TAGS)[number]['id']

/**
 * Global/default encounter environment edited in setup (baseline layer).
 * Localized effects (spells, hazards, patches) apply on top via {@link EncounterEnvironmentZoneOverride}
 * and resolve to {@link EncounterCellEnvironmentResolved}.
 *
 * Lighting and visibility/obscuration stay independent axes (e.g. bright light + heavy obscurement).
 */
export type EncounterEnvironmentBaseline = {
  setting: EncounterEnvironmentSetting
  lightingLevel: EncounterLightingLevel
  terrainMovement: EncounterTerrainMovement
  visibilityObscured: EncounterVisibilityObscured
  /** Additive domain tags; combined with baseline lighting/visibility, not a replacement for them. */
  atmosphereTags: EncounterAtmosphereTag[]
}

export type EncounterAtmosphere = {
  tags?: EncounterAtmosphereTag[]
  notes?: string
}

export type EncounterHazard = {
  id: string
  name: string
  type: 'damage' | 'movement' | 'visibility' | 'condition' | 'other'
  description?: string
  area?: string
  trigger?: 'start_of_turn' | 'enter' | 'end_of_turn' | 'manual'
}

export type EncounterVisibility = {
  obscured: EncounterVisibilityObscured
  causes?: Array<'fog' | 'smoke' | 'rain' | 'foliage' | 'magical'>
  notes?: string
}

export type EncounterTerrain = {
  movement: EncounterTerrainMovement[]
  cover?: Array<'none' | 'half' | 'three-quarters' | 'full'>
  notes?: string
}

export type EncounterLighting = {
  level: EncounterLightingLevel
  tags?: Array<'sunlight' | 'moonlight' | 'firelight' | 'magical-light'>
  notes?: string
}

/**
 * Optional extended/narrative environment shape (nested notes, hazards).
 * Not the same as {@link EncounterEnvironmentBaseline}; kept for future campaign/doc use.
 */
export type EncounterEnvironmentExtended = {
  setting: EncounterEnvironmentSetting
  lighting?: EncounterLighting
  terrain?: EncounterTerrain
  visibility?: EncounterVisibility
  atmosphere?: EncounterAtmosphere
  hazards?: EncounterHazard
  tags?: string[]
  notes?: string
}

/** @deprecated Prefer {@link EncounterEnvironmentExtended}; name retained briefly for any stray imports. */
export type EncounterEnvironment = EncounterEnvironmentExtended

/** What ties a zone override to the battle (spell instance, effect id, etc.). */
export type EncounterEnvironmentOverrideSourceKind =
  | 'battlefield-effect'
  | 'spell'
  | 'manual'
  | 'terrain-feature'

/**
 * Geometry link for localized environment overrides. Phase 0: typed only;
 * radius and some kinds are resolved in later phases when grid integration exists.
 */
export type EncounterEnvironmentAreaLink =
  | { kind: 'grid-cell-ids'; cellIds: string[] }
  | {
      kind: 'grid-cell-radius'
      centerCellId: string
      /** Chebyshev / square radius in cells — exact metric TBD in grid layer. */
      radiusCells: number
    }
  | { kind: 'unattached'; note?: string }

export type EncounterEnvironmentZoneOverride = {
  id: string
  sourceKind: EncounterEnvironmentOverrideSourceKind
  sourceId?: string
  area: EncounterEnvironmentAreaLink
  overrides: {
    lightingLevel?: EncounterLightingLevel
    terrainMovement?: EncounterTerrainMovement
    visibilityObscured?: EncounterVisibilityObscured
    atmosphereTagsAdd?: EncounterAtmosphereTag[]
    atmosphereTagsRemove?: EncounterAtmosphereTag[]
    /** When set, replaces accumulated tags for subsequent merge steps in that zone’s application order. */
    atmosphereTagsReplace?: EncounterAtmosphereTag[]
  }
  /** Reserved for magical darkness / AM field / perception — not interpreted in Phase 0. */
  magical?: {
    magicalDarkness?: boolean
    suppressesDarkvision?: boolean
  }
}

/**
 * Resolved environment at a single grid cell after baseline + ordered zone overrides.
 * Pure domain view; rendering should consume this (or a projection), not invent semantics in the grid.
 */
export type EncounterCellEnvironmentResolved = {
  lightingLevel: EncounterLightingLevel
  terrainMovement: EncounterTerrainMovement
  visibilityObscured: EncounterVisibilityObscured
  atmosphereTags: EncounterAtmosphereTag[]
  /** Zones that applied to this cell, in application order. */
  appliedZoneIds: string[]
}
