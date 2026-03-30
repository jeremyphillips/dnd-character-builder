/**
 * Location domain vocabulary: scale ordering, categories, connection kinds.
 *
 * **First-class content scales** (`CONTENT_LOCATION_SCALE_IDS` / `LOCATION_SCALE_ORDER`):
 * world, city, site, building, floor, room — used for create/edit, field policy, and normal UX.
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

/** Scales that remain first-class **content locations** (create, edit, field policy). */
export const CONTENT_LOCATION_SCALE_IDS = [
  'world',
  'city',
  'site',
  'building',
  'floor',
  'room',
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
