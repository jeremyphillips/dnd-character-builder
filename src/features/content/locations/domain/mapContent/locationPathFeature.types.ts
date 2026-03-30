/**
 * Path feature kinds: linear / network features drawn across cells (roads, rivers).
 *
 * Distinct from cell-wide fills (`locationCellFill.types.ts`), edge-bound features
 * (`locationEdgeFeature.types.ts`), and placed objects (`locationPlacedObject.types.ts`).
 *
 * Future tool intent: **paint** (stroke/network) alongside cell fills; not the edge or place tools.
 */

export const LOCATION_PATH_FEATURE_KIND_IDS = ['road', 'river'] as const;

export type LocationPathFeatureKindId = (typeof LOCATION_PATH_FEATURE_KIND_IDS)[number];

export type LocationPathFeatureKindMeta = {
  label: string;
  description?: string;
};

export const LOCATION_PATH_FEATURE_KIND_META = {
  road: {
    label: 'Road',
    description: 'Overland route or thoroughfare.',
  },
  river: {
    label: 'River',
    description: 'Major watercourse.',
  },
} as const satisfies Record<LocationPathFeatureKindId, LocationPathFeatureKindMeta>;
