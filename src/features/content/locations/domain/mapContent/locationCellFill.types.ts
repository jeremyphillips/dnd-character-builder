/**
 * Cell fill kinds: whole-cell surfaces / terrain / flooring for authored map content.
 *
 * These represent paint-style coverage of an entire grid cell, not strokes along paths,
 * not boundary decorations, and not anchored props.
 *
 * Future tool intent: **paint** tools will combine cell fills with path features (see
 * `locationPathFeature.types.ts`).
 *
 * Presentation: surface fills use **swatch colors** only (`swatchColorKey` via `getMapSwatchColor`
 * / `mapSwatchColors` in `src/app/theme/mapColors.ts`). They are not rendered as MUI icons.
 */

import type { LocationMapCellFillKindId } from '@/shared/domain/locations';

import type { LocationMapSwatchColorKey } from './locationMapSwatchColors.types';

/** Re-export shared ids for feature consumers; same union as {@link LocationCellFillKindId}. */
export { LOCATION_MAP_CELL_FILL_KIND_IDS as LOCATION_CELL_FILL_KIND_IDS } from '@/shared/domain/locations';

/** Sparse cell fill kind (shared persistence + map editor). */
export type LocationCellFillKindId = LocationMapCellFillKindId;

export type LocationCellFillKindMeta = {
  label: string;
  description?: string;
  /**
   * Theme key for swatch color; resolve with `getMapSwatchColor` (app theme).
   * Prefer this over inline hex so colors stay centralized.
   */
  swatchColorKey: LocationMapSwatchColorKey;
  /**
   * Optional direct hex override (e.g. one-off previews). Prefer `swatchColorKey` for normal use.
   */
  swatchColor?: string;
};

export const LOCATION_CELL_FILL_KIND_META = {
  mountains: {
    label: 'Mountains',
    description: 'High, rugged terrain.',
    swatchColorKey: 'cellFillMountains',
  },
  plains: {
    label: 'Plains',
    description: 'Open grassland or steppe.',
    swatchColorKey: 'cellFillPlains',
  },
  forest_light: {
    label: 'Light forest',
    description: 'Sparse or young woodland.',
    swatchColorKey: 'cellFillForestLight',
  },
  forest_heavy: {
    label: 'Dense forest',
    description: 'Thick canopy or old growth.',
    swatchColorKey: 'cellFillForestHeavy',
  },
  swamp: {
    label: 'Swamp',
    description: 'Wetland, marsh, or bayou.',
    swatchColorKey: 'cellFillSwamp',
  },
  desert: {
    label: 'Desert',
    description: 'Arid sand or scrub.',
    swatchColorKey: 'cellFillDesert',
  },
  water: {
    label: 'Water',
    description: 'Sea, lake, or major water body.',
    swatchColorKey: 'cellFillWater',
  },
  stone_floor: {
    label: 'Stone floor',
    description: 'Interior stone or tile flooring.',
    swatchColorKey: 'cellFillStoneFloor',
  },
} as const satisfies Record<LocationCellFillKindId, LocationCellFillKindMeta>;
