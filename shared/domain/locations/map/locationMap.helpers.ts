import type { LocationScaleId } from '../location.types';
import type { LocationMapKindId } from './locationMap.types';

const WORLD_GRID_SCALES = new Set<LocationScaleId>(['world']);

/**
 * Host scales whose default campaign map uses **area-grid** (macro tactical).
 * Includes legacy region/subregion/district locations still in the DB; new geographic expression
 * for those concepts is **MapZone** on parent maps (`zones/mapZone.policy.ts`).
 */
const AREA_GRID_MAP_SCALES = new Set<LocationScaleId>([
  'city',
  'site',
  'region',
  'subregion',
  'district',
]);

/** Picks a default map kind from location scale for authored campaign maps. */
export function mapKindForLocationScale(scale: string): LocationMapKindId {
  const s = scale as LocationScaleId;
  if (WORLD_GRID_SCALES.has(s)) return 'world-grid';
  if (AREA_GRID_MAP_SCALES.has(s)) return 'area-grid';
  return 'encounter-grid';
}

/** Canonical map kinds allowed for this location scale (single entry today; expandable). */
export function getAllowedMapKindsForScale(scale: string): readonly LocationMapKindId[] {
  return [mapKindForLocationScale(scale)];
}

export function getDefaultMapKindForScale(scale: string): LocationMapKindId {
  return mapKindForLocationScale(scale);
}
