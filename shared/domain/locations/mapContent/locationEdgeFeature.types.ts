/**
 * Edge feature kinds: content that lives on **cell boundaries** (walls, windows, doors).
 *
 * Distinct from path strokes and from objects with a cell footprint.
 *
 * Future tool intent: dedicated **edge** tool; not paint-fill or place-object flows.
 */

export const LOCATION_EDGE_FEATURE_KIND_IDS = ['wall', 'window', 'door'] as const;

export type LocationEdgeFeatureKindId = (typeof LOCATION_EDGE_FEATURE_KIND_IDS)[number];

export type LocationEdgeFeatureKindMeta = {
  label: string;
  description?: string;
};

export const LOCATION_EDGE_FEATURE_KIND_META = {
  wall: {
    label: 'Wall',
    description: 'Solid boundary between cells.',
  },
  window: {
    label: 'Window',
    description: 'Opening in a wall.',
  },
  door: {
    label: 'Door',
    description: 'Passage or threshold on an edge.',
  },
} as const satisfies Record<LocationEdgeFeatureKindId, LocationEdgeFeatureKindMeta>;
