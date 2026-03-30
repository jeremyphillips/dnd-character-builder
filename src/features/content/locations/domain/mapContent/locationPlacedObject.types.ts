/**
 * Placed object kinds: anchored / footprint objects on a map (settlements, structures, props).
 *
 * This vocabulary is for **authored map content** (what the author places on the grid).
 * It is separate from:
 * - `LOCATION_MAP_OBJECT_KIND_IDS` in shared `map/locationMap.constants.ts` (persisted cell-object
 *   kinds like marker / obstacle), and
 * - `LOCATION_SCALE_FIELD_POLICY` (form field / setup policy).
 *
 * Future tool intent: **place** tool; not paint or edge tools.
 */

export const LOCATION_PLACED_OBJECT_KIND_IDS = [
  'city',
  'building',
  'site',
  'tree',
  'table',
  'stairs',
  'treasure',
] as const;

export type LocationPlacedObjectKindId = (typeof LOCATION_PLACED_OBJECT_KIND_IDS)[number];

export type LocationPlacedObjectKindMeta = {
  label: string;
  description?: string;
};

export const LOCATION_PLACED_OBJECT_KIND_META = {
  city: {
    label: 'City',
    description: 'Settlement or major urban marker.',
  },
  building: {
    label: 'Building',
    description: 'Structure footprint or icon.',
  },
  site: {
    label: 'Site',
    description: 'Point of interest or minor location.',
  },
  tree: {
    label: 'Tree',
    description: 'Vegetation or landmark tree.',
  },
  table: {
    label: 'Table',
    description: 'Furniture or surface.',
  },
  stairs: {
    label: 'Stairs',
    description: 'Vertical circulation between levels.',
  },
  treasure: {
    label: 'Treasure',
    description: 'Loot, hoard, or objective.',
  },
} as const satisfies Record<LocationPlacedObjectKindId, LocationPlacedObjectKindMeta>;
