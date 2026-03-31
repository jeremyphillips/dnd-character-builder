import type { LocationCellFillKindMeta, LocationMapSwatchColorKey } from '@/features/content/locations/domain/mapContent';

import { colorPrimitives } from './colorPrimitives';

/**
 * Location map swatch colors — keyed for cell fills; hex values resolve from
 * `colorPrimitives` (single source of truth). Split light/dark when needed.
 */
export const baseMapSwatchColors: Record<LocationMapSwatchColorKey, string> = {
  cellFillMountains: colorPrimitives.mapSlate[300],
  cellFillPlains: colorPrimitives.mapGreen[100],
  cellFillForestLight: colorPrimitives.mapGreen[200],
  cellFillForestHeavy: colorPrimitives.mapGreen[500],
  cellFillSwamp: colorPrimitives.mapGreen[300],
  cellFillDesert: colorPrimitives.mapSand[300],
  cellFillWater: colorPrimitives.mapBlue[300],
  cellFillStoneFloor: colorPrimitives.mapSlate[100],
};

export const lightMapSwatchColors = baseMapSwatchColors;
export const darkMapSwatchColors = baseMapSwatchColors;

/** Default export for callers that do not branch on color scheme yet. */
export const mapSwatchColors = baseMapSwatchColors;

export function getMapSwatchColor(key: LocationMapSwatchColorKey): string {
  return mapSwatchColors[key];
}

/** Resolved swatch hex for cell-fill metadata (optional `swatchColor` overrides theme key). */
export function resolveCellFillSwatchColor(meta: LocationCellFillKindMeta): string {
  return meta.swatchColor ?? getMapSwatchColor(meta.swatchColorKey);
}
