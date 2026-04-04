import type { LocationStairEndpointRef } from '@/shared/domain/locations';

import { listLocationMaps, updateLocationMap } from '@/features/content/locations/domain/repo/locationMapRepo';

import { patchStairObjectConnectionIdInCellEntries } from './mapCellEntriesStairConnection';

/**
 * PATCHes the default (or first) map for a floor so the stair object’s `connectionId` matches the canonical connection (or clears it).
 */
export async function patchFloorStairConnectionIdOnDefaultMap(
  campaignId: string,
  ref: LocationStairEndpointRef,
  connectionId: string | null,
): Promise<void> {
  const maps = await listLocationMaps(campaignId, ref.floorLocationId);
  const map = maps.find((m) => m.isDefault) ?? maps[0];
  if (!map) return;
  const cellEntries = patchStairObjectConnectionIdInCellEntries(map.cellEntries, ref, connectionId);
  await updateLocationMap(campaignId, ref.floorLocationId, map.id, { cellEntries });
}
