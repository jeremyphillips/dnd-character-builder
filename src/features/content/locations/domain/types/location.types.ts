/**
 * Campaign / system location content types.
 * Shared field blocks and scale profiles: `@/shared/domain/locations` — especially `LocationBaseFields`.
 */
import type {
  LocationBaseFields,
  LocationConnection,
  LocationLabel,
  LocationScaleId,
} from '@/shared/domain/locations';
import type {
  ContentId,
  ContentInput,
  ContentItem,
} from '@/features/content/shared/domain/types/content.types';

export type LocationId = ContentId;

/** Client + shared domain fields for a location (content shell + reusable location block). */
export type Location = ContentItem & LocationBaseFields;

/** List row: resolved location plus optional ruleset allow flag. */
export type LocationSummary = Location & { allowedInCampaign?: boolean };

export type LocationInput = ContentInput & Partial<LocationBaseFields>;

export type { LocationConnection, LocationLabel, LocationBaseFields, LocationScaleId };
