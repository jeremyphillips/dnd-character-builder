/**
 * Semantic icon tokens for location map presentation (no React/MUI here).
 *
 * Ownership:
 * - **Object** — persisted cell-object kinds + authored prop glyphs (place tool).
 * - **Scale** — hierarchy / linked-location affordances (`map_*`).
 *
 * Cell **fills** use swatch colors only (`LOCATION_CELL_FILL_KIND_META`); they do not
 * participate in these icon namespaces.
 */

/** Scale affordance icons (linked map / hierarchy markers). */
export const LOCATION_MAP_SCALE_ICON_NAME_IDS = [
  'map_world',
  'map_region',
  'map_subregion',
  'map_city',
  'map_district',
  'map_site',
  'map_building',
  'map_floor',
  'map_room',
] as const;

export type LocationMapScaleIconName = (typeof LOCATION_MAP_SCALE_ICON_NAME_IDS)[number];

/**
 * Icons for persisted map objects and local props (not terrain fill swatches).
 * Includes `tree` as an object glyph (same visual intent as dense-forest fill color elsewhere).
 */
export const LOCATION_MAP_OBJECT_ICON_NAME_IDS = [
  'marker',
  'table',
  'treasure',
  'door',
  'stairs',
  'tree',
] as const;

export type LocationMapObjectIconName = (typeof LOCATION_MAP_OBJECT_ICON_NAME_IDS)[number];

/** Any glyph token the map UI resolves to a MUI icon (object + scale). */
export type LocationMapGlyphIconName = LocationMapObjectIconName | LocationMapScaleIconName;
