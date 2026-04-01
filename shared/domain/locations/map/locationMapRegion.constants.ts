/**
 * Curated region overlay preset keys (authoring). Values resolve in app theme from primitives.
 */
export const LOCATION_MAP_REGION_COLOR_KEYS = [
  'regionRed',
  'regionBlue',
  'regionGreen',
  'regionPurple',
  'regionGold',
  'regionTeal',
  'regionOrange',
  'regionGray',
] as const;

export type LocationMapRegionColorKey = (typeof LOCATION_MAP_REGION_COLOR_KEYS)[number];
