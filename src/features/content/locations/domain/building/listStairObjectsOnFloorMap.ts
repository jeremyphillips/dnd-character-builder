/**
 * Reads authored floor maps to list stair endpoints for pairing UI (Phase 2).
 * Not used for combat traversal.
 */
import { listLocationMaps } from '@/features/content/locations/domain/repo/locationMapRepo';

export type StairObjectOption = {
  value: string;
  label: string;
  cellId: string;
  objectId: string;
};

/**
 * Returns stair objects on the default (or first) map for a floor location, for link pickers.
 */
export async function listStairObjectOptionsForFloor(
  campaignId: string,
  floorLocationId: string,
): Promise<StairObjectOption[]> {
  const maps = await listLocationMaps(campaignId, floorLocationId);
  const map = maps.find((m) => m.isDefault) ?? maps[0];
  if (!map?.cellEntries?.length) return [];
  const out: StairObjectOption[] = [];
  for (const row of map.cellEntries) {
    for (const o of row.objects ?? []) {
      if (o.kind !== 'stairs') continue;
      out.push({
        objectId: o.id,
        cellId: row.cellId,
        value: `${row.cellId}::${o.id}`,
        label: `Cell ${row.cellId}${o.label ? ` — ${o.label}` : ''}`,
      });
    }
  }
  return out;
}

export function parseStairObjectOptionValue(value: string): { cellId: string; objectId: string } | null {
  const idx = value.indexOf('::');
  if (idx <= 0) return null;
  const cellId = value.slice(0, idx);
  const objectId = value.slice(idx + 2);
  if (!cellId || !objectId) return null;
  return { cellId, objectId };
}
