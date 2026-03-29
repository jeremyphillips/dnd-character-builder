import { LOCATION_SCALE_ORDER } from './location.constants';
import type { LocationMapKindId } from './locationMap.types';

type LocationScaleId = (typeof LOCATION_SCALE_ORDER)[number];

const WORLD_SCALES = new Set<LocationScaleId>(['world', 'region', 'subregion']);
const AREA_SCALES = new Set<LocationScaleId>(['city', 'district', 'site']);

/** Picks a default map kind from location scale for authored campaign maps. */
export function mapKindForLocationScale(scale: string): LocationMapKindId {
  const s = scale as LocationScaleId;
  if (WORLD_SCALES.has(s)) return 'world-grid';
  if (AREA_SCALES.has(s)) return 'area-grid';
  return 'encounter-grid';
}
