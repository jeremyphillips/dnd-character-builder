/**
 * Canonical **base** edge kinds (walls, openings on boundaries). Persisted on maps as `edgeEntries[].kind`.
 * Finer variation (materials, future typed state) may use vocabularies in `locationEdgeFeature.facets.ts` and
 * persisted `LocationMapEdgeAuthoringEntry` — not additional top-level ids in this tuple.
 */
export const LOCATION_MAP_EDGE_KIND_IDS = ['wall', 'window', 'door'] as const;

export type LocationMapEdgeKindId = (typeof LOCATION_MAP_EDGE_KIND_IDS)[number];
