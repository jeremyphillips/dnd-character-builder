/**
 * Location domain vocabulary: scale ordering, categories, connection kinds.
 *
 * **Content field policy** (`CONTENT_LOCATION_SCALE_IDS` / `LOCATION_SCALE_ORDER`): world, city, site,
 * building, floor, room — includes interior for persisted rows and building workspace.
 *
 * **Standalone create & top-level list** (`SURFACE_LOCATION_CONTENT_SCALE_IDS`): world, city, site,
 * building only — floor/room use building UX (`INTERIOR_LOCATION_SCALE_IDS`, `locationScaleUi.policy.ts`).
 *
 * **Legacy map-zone-as-location scales** (`LEGACY_MAP_ZONE_LOCATION_SCALE_IDS`): region, subregion,
 * district — may still appear in persisted data; geographic expression is moving to **MapZone**
 * on parent maps (`zones/mapZone.policy.ts`). Do not offer these in new location authoring.
 *
 * **Ranking / sort** of any persisted scale: use `LOCATION_SCALE_RANK_ORDER_LEGACY` (includes all
 * nine). Generic rank helpers in `locationScale.rules.ts` use this legacy order so old rows sort
 * sensibly next to canonical scales.
 *
 * Explicit parent rules: `locationScale.policy.ts` (`ALLOWED_PARENT_SCALES_BY_SCALE`). Map cell
 * authoring: `locationMapPlacement.policy.ts`.
 */

/**
 * Scales that remain first-class **content locations** (field policy, edit display, hierarchy).
 * Includes interior scales (floor, room) used for persisted records and building workspace.
 */
export const CONTENT_LOCATION_SCALE_IDS = [
  'world',
  'city',
  'site',
  'building',
  'floor',
  'room',
] as const;

/**
 * **Interior** scales — floors and rooms under a building. Not offered in standalone “new location”
 * flows and not listed as top-level campaign rows; use building edit + floor strip / interior UX.
 */
export const INTERIOR_LOCATION_SCALE_IDS = ['floor', 'room'] as const;

/**
 * **Surface / campaign** scales — world, city, site, building. Standalone create + main location
 * list. Excludes interior (floor/room) and legacy map-zone scales (region/subregion/district).
 */
export const SURFACE_LOCATION_CONTENT_SCALE_IDS = [
  'world',
  'city',
  'site',
  'building',
] as const;

/**
 * Scales in campaign location **list filters** (excludes interior floor/room).
 * Same order as {@link LOCATION_SCALE_RANK_ORDER_LEGACY} minus {@link INTERIOR_LOCATION_SCALE_IDS}.
 */
export const CAMPAIGN_LOCATION_LIST_SCALE_IDS = [
  'world',
  'region',
  'subregion',
  'city',
  'district',
  'site',
  'building',
] as const;

/**
 * Scales historically modeled as locations; retained for persisted rows and legacy field policy
 * only — not for new authoring (use MapZone kinds on parent maps instead).
 */
export const LEGACY_MAP_ZONE_LOCATION_SCALE_IDS = ['region', 'subregion', 'district'] as const;

/** All scale ids that may appear in API/DB (content + legacy). */
export const ALL_LOCATION_SCALE_IDS = [
  ...CONTENT_LOCATION_SCALE_IDS,
  ...LEGACY_MAP_ZONE_LOCATION_SCALE_IDS,
] as const;

/**
 * Canonical coarsest → finest order for **first-class content** locations only.
 * Prefer this for new UI lists that should not imply legacy scales are creatable.
 */
export const LOCATION_SCALE_ORDER = CONTENT_LOCATION_SCALE_IDS;

/**
 * Full coarsest → finest order including legacy scales — use for **sorting/ranking** persisted
 * locations that may still use region/subregion/district.
 */
export const LOCATION_SCALE_RANK_ORDER_LEGACY = [
  'world',
  'region',
  'subregion',
  'city',
  'district',
  'site',
  'building',
  'floor',
  'room',
] as const;

export const LOCATION_CATEGORY_IDS = [
  'wilderness',
  'settlement',
  'district',
  'landmark',
  'structure',
  'interior',
  'dungeon',
] as const;

/** Matches persisted connection `kind` enum (CampaignLocation). */
export const LOCATION_CONNECTION_KIND_IDS = [
  'road',
  'river',
  'door',
  'stairs',
  'hall',
  'secret',
  'portal',
] as const;
