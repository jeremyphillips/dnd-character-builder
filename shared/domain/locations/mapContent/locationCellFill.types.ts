/**
 * Cell fill kinds: whole-cell surfaces / terrain / flooring for authored map content.
 *
 * These represent paint-style coverage of an entire grid cell, not strokes along paths,
 * not boundary decorations, and not anchored props.
 *
 * Future tool intent: **paint** tools will combine cell fills with path features (see
 * `locationPathFeature.types.ts`).
 */

export const LOCATION_CELL_FILL_KIND_IDS = [
  'mountains',
  'plains',
  'forest_light',
  'forest_heavy',
  'swamp',
  'desert',
  'water',
  'stone_floor',
] as const;

export type LocationCellFillKindId = (typeof LOCATION_CELL_FILL_KIND_IDS)[number];

export type LocationCellFillKindMeta = {
  label: string;
  description?: string;
};

export const LOCATION_CELL_FILL_KIND_META = {
  mountains: {
    label: 'Mountains',
    description: 'High, rugged terrain.',
  },
  plains: {
    label: 'Plains',
    description: 'Open grassland or steppe.',
  },
  forest_light: {
    label: 'Light forest',
    description: 'Sparse or young woodland.',
  },
  forest_heavy: {
    label: 'Dense forest',
    description: 'Thick canopy or old growth.',
  },
  swamp: {
    label: 'Swamp',
    description: 'Wetland, marsh, or bayou.',
  },
  desert: {
    label: 'Desert',
    description: 'Arid sand or scrub.',
  },
  water: {
    label: 'Water',
    description: 'Sea, lake, or major water body.',
  },
  stone_floor: {
    label: 'Stone floor',
    description: 'Interior stone or tile flooring.',
  },
} as const satisfies Record<LocationCellFillKindId, LocationCellFillKindMeta>;
