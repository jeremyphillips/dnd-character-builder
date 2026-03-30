/**
 * Building-specific classification for **building-scale** locations (`scale === 'building'`).
 * Persistence and UI wiring are deferred; this is the feature-local domain vocabulary.
 */

/** Reference to an NPC or player character for ownership / staffing. */
export type LocationEntityRef = {
  kind: 'npc' | 'character';
  id: string;
};

/** Lightweight business/public hours — string-based, not a scheduling engine. */
export type LocationHoursOfOperation = {
  isAlwaysOpen?: boolean;
  openTime?: string;
  closeTime?: string;
  /** e.g. weekday names or short codes — author-defined until stricter schema exists. */
  openDays?: string[];
};

export const LOCATION_BUILDING_PRIMARY_TYPE_IDS = [
  'residence',
  'business',
  'temple',
  'civic',
  'industrial',
  'military',
  'hospitality',
  'guild',
  'other',
] as const;

export type LocationBuildingPrimaryTypeId = (typeof LOCATION_BUILDING_PRIMARY_TYPE_IDS)[number];

export const LOCATION_BUILDING_PRIMARY_SUBTYPE_IDS = [
  'house',
  'manor',
  'apartment',
  'blacksmith',
  'apothecary',
  'general-store',
  'bakery',
  'workshop',
  'warehouse',
  'tavern',
  'inn',
  'brothel',
  'shrine',
  'temple',
  'cathedral',
  'town-hall',
  'guard-post',
  'guild-house',
  'other',
] as const;

export type LocationBuildingPrimarySubtypeId = (typeof LOCATION_BUILDING_PRIMARY_SUBTYPE_IDS)[number];

export const LOCATION_BUILDING_FUNCTION_IDS = [
  'lodging',
  'food-drink',
  'trade',
  'craft',
  'worship',
  'administration',
  'storage',
  'security',
  'guild-activity',
  'entertainment',
  'residential',
  'manufacturing',
  'healing',
  'education',
  'hospitality-service',
  'other',
] as const;

export type LocationBuildingFunctionId = (typeof LOCATION_BUILDING_FUNCTION_IDS)[number];

/**
 * Authoring profile for a building location — identity, mixed-use functions, access, staffing.
 * Does not replace location `scale` / `category`; complements building-scale records.
 */
export type LocationBuildingProfile = {
  primaryType?: LocationBuildingPrimaryTypeId;
  primarySubtype?: LocationBuildingPrimarySubtypeId;
  /** Mixed-use or secondary roles (e.g. tavern + inn). */
  functions?: LocationBuildingFunctionId[];

  isPublicStorefront?: boolean;
  hoursOfOperation?: LocationHoursOfOperation;

  ownerRefs?: LocationEntityRef[];
  staffRefs?: LocationEntityRef[];

  factionId?: string;
  notes?: string;
};
