import type { GridSizePreset } from '@/shared/domain/grid/gridPresets';
import { GRID_SIZE_PRESETS } from '@/shared/domain/grid/gridPresets';
import {
  getDefaultGeometryForScale,
  normalizeGridCellUnitForScale,
  type LocationBuildingInteriorBootstrapPresetId,
  type LocationScaleId,
} from '@/shared/domain/locations';

import type { Location } from '@/features/content/locations/domain/model/location';
import { LOCATION_FORM_DEFAULTS } from '../config/locationForm.config';
import type { LocationFormValues } from '../types/locationForm.types';
import { sanitizeLocationFormValues } from '../rules/locationFormSanitize';

const INTERIOR_TO_GRID_PRESET: Record<LocationBuildingInteriorBootstrapPresetId, GridSizePreset> = {
  compact: 'small',
  standard: 'medium',
  large: 'large',
};

export type LocationCreateSetupDraft = {
  name: string;
  scale: string;
  parentId: string;
  category: string;
  gridCellUnit: string;
  gridPresetKey: GridSizePreset;
  /** Building scale — maps to `buildingMeta` + first-floor grid via {@link INTERIOR_TO_GRID_PRESET} */
  buildingPrimaryType?: string;
  buildingPrimarySubtype?: string;
  buildingFunctions?: string[];
  buildingIsPublicStorefront?: boolean;
  interiorPresetKey?: LocationBuildingInteriorBootstrapPresetId;
};

export function buildLocationFormValuesFromSetup(
  draft: LocationCreateSetupDraft,
  locations: Location[],
): LocationFormValues {
  const scale = draft.scale as LocationScaleId;
  const isBuilding = scale === 'building';
  const interiorKey: LocationBuildingInteriorBootstrapPresetId =
    draft.interiorPresetKey ?? 'standard';
  const gridPresetKey = isBuilding ? INTERIOR_TO_GRID_PRESET[interiorKey] : draft.gridPresetKey;
  const preset = GRID_SIZE_PRESETS[gridPresetKey];
  const base: LocationFormValues = {
    ...LOCATION_FORM_DEFAULTS,
    name: draft.name.trim(),
    scale: draft.scale,
    parentId: draft.parentId.trim(),
    category: draft.category.trim(),
    gridPreset: gridPresetKey,
    gridColumns: String(preset.columns),
    gridRows: String(preset.rows),
    gridCellUnit: normalizeGridCellUnitForScale(draft.gridCellUnit, draft.scale),
    gridGeometry: getDefaultGeometryForScale(scale),
    ...(isBuilding
      ? {
          buildingPrimaryType: draft.buildingPrimaryType?.trim() ?? '',
          buildingPrimarySubtype: draft.buildingPrimarySubtype?.trim() ?? '',
          buildingFunctions: Array.isArray(draft.buildingFunctions) ? draft.buildingFunctions : [],
          buildingIsPublicStorefront: Boolean(draft.buildingIsPublicStorefront),
        }
      : {}),
  };

  const patch = sanitizeLocationFormValues(base, {
    scale: draft.scale,
    locations,
  });

  return { ...base, ...patch };
}
