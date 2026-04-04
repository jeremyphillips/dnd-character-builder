import { normalizedAuthoringPayloadFromGridDraft, stableStringify } from '@/features/content/locations/components/locationGridDraft.utils';
import type { LocationGridDraftState } from '@/features/content/locations/components/locationGridDraft.types';
import type { LocationFormValues } from '@/features/content/locations/domain';
import { toLocationInput } from '@/features/content/locations/domain';
import type { LocationContentItem } from '@/features/content/locations/domain/repo/locationRepo';
import type { LocationInput } from '@/features/content/locations/domain/types';
import type { LocationVerticalStairConnection } from '@/shared/domain/locations';

/**
 * Single persistable string for campaign location edit: merged location input (as saved) + map bootstrap payload.
 * Keep aligned with {@link useLocationEditSaveActions} `handleCampaignSubmit`.
 */
export function serializeLocationWorkspacePersistableSnapshot(
  values: LocationFormValues,
  gridDraft: LocationGridDraftState,
  buildingStairConnections: readonly LocationVerticalStairConnection[],
  loc: LocationContentItem | null,
): string {
  const input = toLocationInput(values);
  const mergedInput = mergeBuildingProfileForSave(input, loc, buildingStairConnections);
  const mapPayload = {
    excludedCellIds: [...gridDraft.excludedCellIds].sort(),
    ...normalizedAuthoringPayloadFromGridDraft(gridDraft),
  };
  return stableStringify({ location: mergedInput, map: mapPayload });
}

function mergeBuildingProfileForSave(
  input: LocationInput,
  loc: LocationContentItem | null,
  buildingStairConnections: readonly LocationVerticalStairConnection[],
): LocationInput {
  if (!loc || loc.source !== 'campaign' || loc.scale !== 'building') {
    return input;
  }
  return {
    ...input,
    buildingProfile: {
      ...(loc.buildingProfile ?? {}),
      ...(input.buildingProfile ?? {}),
      stairConnections: [...buildingStairConnections],
    },
  };
}
