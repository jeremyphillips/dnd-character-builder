import type { Location } from '@/features/content/locations/domain/model/location';
import {
  getPlacedObjectDefinition,
  parseLocationPlacedObjectKindId,
  type LocationPlacedObjectKindId,
} from '@/features/content/locations/domain/model/placedObjects/locationPlacedObject.types';
import type { LocationMapObjectKindId } from '@/shared/domain/locations';
import { parseGridCellId } from '@/shared/domain/grid/gridCellIds';

/** Human-readable cell coordinates for the placement slot (Phase 4 shared template). */
export function formatCellPlacementLine(cellId: string): string {
  const p = parseGridCellId(cellId);
  if (!p) return `Cell ${cellId}`;
  return `Cell ${p.x},${p.y}`;
}

const LEGACY_MAP_OBJECT_KIND_TITLE: Record<LocationMapObjectKindId, string> = {
  marker: 'Marker',
  table: 'Table',
  treasure: 'Treasure',
  door: 'Door',
  stairs: 'Stairs',
};

/** Title when `authoredPlaceKindId` is missing (legacy / non-palette rows). */
export function legacyMapObjectKindTitle(kind: LocationMapObjectKindId): string {
  return LEGACY_MAP_OBJECT_KIND_TITLE[kind] ?? kind;
}

/**
 * When true, the rail should show the linked campaign location name as display identity and hide the freeform Label field.
 * Applies to registry families with `linkedScale` that matches the linked location’s scale.
 */
export function shouldShowLinkedIdentityForPlacedObject(
  placedKind: LocationPlacedObjectKindId | null,
  linkedLocationId: string | undefined,
  linkedLoc: Location | undefined,
): boolean {
  if (!placedKind || !linkedLocationId || !linkedLoc) return false;
  const def = getPlacedObjectDefinition(placedKind);
  if (!def.linkedScale) return false;
  return linkedLoc.scale === def.linkedScale;
}

