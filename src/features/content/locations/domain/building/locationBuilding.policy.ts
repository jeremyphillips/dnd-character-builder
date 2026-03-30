import type {
  LocationBuildingFunctionId,
  LocationBuildingPrimarySubtypeId,
  LocationBuildingPrimaryTypeId,
} from './locationBuilding.types';
import {
  LOCATION_BUILDING_PRIMARY_SUBTYPE_META,
  LOCATION_BUILDING_PRIMARY_TYPE_META,
  LOCATION_BUILDING_FUNCTION_META,
} from './locationBuilding.meta';

/**
 * Allowed `primarySubtype` values per `primaryType`. Empty or missing type: no restriction at domain level.
 */
export const ALLOWED_LOCATION_BUILDING_PRIMARY_SUBTYPES_BY_TYPE: Record<
  LocationBuildingPrimaryTypeId,
  readonly LocationBuildingPrimarySubtypeId[]
> = {
  residence: ['house', 'manor', 'apartment', 'other'],
  business: [
    'blacksmith',
    'apothecary',
    'general-store',
    'bakery',
    'workshop',
    'warehouse',
    'other',
  ],
  temple: ['shrine', 'temple', 'cathedral', 'other'],
  civic: ['town-hall', 'guard-post', 'other'],
  industrial: ['workshop', 'warehouse', 'other'],
  military: ['guard-post', 'other'],
  hospitality: ['tavern', 'inn', 'brothel', 'other'],
  guild: ['guild-house', 'other'],
  other: ['other'],
};

export function getAllowedLocationBuildingPrimarySubtypesForType(
  primaryType: LocationBuildingPrimaryTypeId | string | undefined,
): readonly LocationBuildingPrimarySubtypeId[] {
  if (!primaryType) return [];
  const key = primaryType as LocationBuildingPrimaryTypeId;
  const row = ALLOWED_LOCATION_BUILDING_PRIMARY_SUBTYPES_BY_TYPE[key];
  return row ?? [];
}

export function getLocationBuildingPrimaryTypeLabel(id: LocationBuildingPrimaryTypeId): string {
  return LOCATION_BUILDING_PRIMARY_TYPE_META[id].label;
}

export function getLocationBuildingPrimarySubtypeLabel(id: LocationBuildingPrimarySubtypeId): string {
  return LOCATION_BUILDING_PRIMARY_SUBTYPE_META[id].label;
}

export function getLocationBuildingFunctionLabel(id: LocationBuildingFunctionId): string {
  return LOCATION_BUILDING_FUNCTION_META[id].label;
}
