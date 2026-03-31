/** Canonical path kinds (roads, rivers). */
export const LOCATION_MAP_PATH_KIND_IDS = ['road', 'river'] as const;

export type LocationMapPathKindId = (typeof LOCATION_MAP_PATH_KIND_IDS)[number];

/** @deprecated Use LOCATION_MAP_PATH_KIND_IDS */
export const LOCATION_MAP_PATH_FEATURE_KIND_IDS = LOCATION_MAP_PATH_KIND_IDS;

/** @deprecated Use LocationMapPathKindId */
export type LocationMapPathFeatureKindId = LocationMapPathKindId;
