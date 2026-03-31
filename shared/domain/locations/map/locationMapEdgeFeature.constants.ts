/** Canonical edge kinds (walls, openings on cell boundaries). */
export const LOCATION_MAP_EDGE_KIND_IDS = ['wall', 'window', 'door'] as const;

export type LocationMapEdgeKindId = (typeof LOCATION_MAP_EDGE_KIND_IDS)[number];

/** @deprecated Use LOCATION_MAP_EDGE_KIND_IDS */
export const LOCATION_MAP_EDGE_FEATURE_KIND_IDS = LOCATION_MAP_EDGE_KIND_IDS;

/** @deprecated Use LocationMapEdgeKindId */
export type LocationMapEdgeFeatureKindId = LocationMapEdgeKindId;
