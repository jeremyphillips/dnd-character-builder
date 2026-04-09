import type { LocationBuildingMeta } from './locationBuilding.types';

/**
 * Pure seam for later city-map building marker defaults: suggests a registry `building` family
 * variant id from identity — does **not** persist city placement; map authoring remains authoritative.
 */
export function recommendBuildingPlacementVariant(
  meta: Pick<LocationBuildingMeta, 'primaryType' | 'primarySubtype'>,
): 'residential' | 'civic' {
  const t = meta.primaryType;
  if (t === 'civic' || t === 'temple' || t === 'military' || t === 'guild') {
    return 'civic';
  }
  if (t === 'industrial') {
    return 'civic';
  }
  return 'residential';
}
