/**
 * Explicit location scale *business* policy (parent eligibility, etc.).
 *
 * For generic structural comparisons (rank, broader/finer), use `locationScale.rules.ts`
 * and `LOCATION_SCALE_RANK_ORDER_LEGACY` — ordering alone does not encode which parent scales are valid.
 *
 * Legacy rows may still use region/subregion/district in parent chains; new authoring should prefer
 * world → city → site → building → floor → room without inserting those legacy scales.
 */
import { LOCATION_SCALE_RANK_ORDER_LEGACY } from '../location.constants';
import type { LocationScaleId } from '../location.types';

/** Child scale → parent scales that may be assigned (empty = root only, e.g. world). */
export const ALLOWED_PARENT_SCALES_BY_SCALE: Record<
  LocationScaleId,
  readonly LocationScaleId[]
> = {
  world: [],
  /** Legacy — prefer MapZones on world map. */
  region: ['world'],
  /** Legacy. */
  subregion: ['world', 'region'],
  /** Canonical macro place; may sit under world only for new trees; legacy paths may use region/subregion parents. */
  city: ['world', 'region', 'subregion'],
  /** Legacy urban fabric — prefer MapZones on city map. */
  district: ['city'],
  /** Sites under macro area; legacy rows may reference district/region/subregion parents. */
  site: ['world', 'region', 'subregion', 'city', 'district'],
  building: ['site', 'city', 'district'],
  floor: ['building'],
  room: ['floor', 'building'],
};

function isKnownScale(scale: string): scale is LocationScaleId {
  return (LOCATION_SCALE_RANK_ORDER_LEGACY as readonly string[]).includes(scale);
}

export function getAllowedParentScalesForScale(childScale: string): readonly LocationScaleId[] {
  if (!isKnownScale(childScale)) return [];
  return ALLOWED_PARENT_SCALES_BY_SCALE[childScale];
}

export function isAllowedParentScale(parentScale: string, childScale: string): boolean {
  if (!isKnownScale(parentScale) || !isKnownScale(childScale)) return false;
  const allowed = ALLOWED_PARENT_SCALES_BY_SCALE[childScale as LocationScaleId];
  return (allowed as readonly string[]).includes(parentScale);
}

export function isAllowedParentLocation<T extends { scale: string }>(
  parent: T,
  childScale: string,
): boolean {
  return isAllowedParentScale(parent.scale, childScale);
}

/**
 * Campaign locations eligible as parent for a child of `childScale`.
 * Excludes: world children (no parents); scales that cannot host children (room); self on edit via `excludeLocationId`.
 */
export function getAllowedParentLocationOptions<T extends { id: string; scale: string }>(
  locations: T[],
  childScale: string,
  excludeLocationId?: string,
): T[] {
  if (childScale === 'world') return [];
  return locations.filter((loc) => {
    if (excludeLocationId && loc.id === excludeLocationId) return false;
    if (loc.scale === 'room') return false;
    return isAllowedParentScale(loc.scale, childScale);
  });
}
