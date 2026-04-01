import type { LocationCellFillKindId } from '@/features/content/locations/domain/mapContent/locationCellFill.types';
import { LOCATION_MAP_REGION_COLOR_KEYS } from '@/features/content/locations/domain/mapContent/locationMapRegionColors.types';
import type { LocationMapRegionColorKey } from '@/features/content/locations/domain/mapContent/locationMapRegionColors.types';

import {
  DEFAULT_REGION_PAINT_LABEL,
  type LocationMapActivePaintSelection,
  type LocationMapPaintState,
} from './locationMapEditor.types';

export function createInitialPaintState(): LocationMapPaintState {
  return {
    domain: 'surface',
    surfaceFillKind: null,
    activeRegionColorKey: null,
    activeRegionDraftId: null,
    regionLabel: DEFAULT_REGION_PAINT_LABEL,
  };
}

/**
 * Terrain stroke applies only in Surface paint domain with a chosen fill swatch.
 */
export function getActiveSurfaceFillKind(
  selection: LocationMapActivePaintSelection,
): LocationCellFillKindId | null {
  if (!selection || selection.domain !== 'surface') {
    return null;
  }
  return selection.surfaceFillKind;
}

export function canApplySurfaceTerrainPaint(
  selection: LocationMapActivePaintSelection,
): boolean {
  return getActiveSurfaceFillKind(selection) != null;
}

/**
 * When entering Region paint, ensure a stable draft id and a default preset color.
 */
export function ensureRegionDraftTarget(
  state: LocationMapPaintState,
  newId: () => string = () => crypto.randomUUID(),
): LocationMapPaintState {
  const draftId = state.activeRegionDraftId ?? newId();
  const colorKey: LocationMapRegionColorKey =
    state.activeRegionColorKey ?? LOCATION_MAP_REGION_COLOR_KEYS[0];
  return {
    ...state,
    domain: 'region',
    activeRegionDraftId: draftId,
    activeRegionColorKey: colorKey,
  };
}
