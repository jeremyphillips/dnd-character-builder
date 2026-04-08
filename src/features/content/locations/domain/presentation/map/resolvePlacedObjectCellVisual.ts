/**
 * Shared raster / label resolution for map placed objects (authored registry + persisted map object kinds).
 * Used by tactical grid cells and authored-map overlay so the same kind resolves to the same visual.
 */
import type { LocationMapObjectKindId } from '@/shared/domain/locations';
import type { LocationMapAuthoredObjectRenderItem } from '@/shared/domain/locations/map/locationMapAuthoredObjectRender.types';

import type { LocationPlacedObjectKindId } from '../../model/placedObjects/locationPlacedObject.registry';
import { getPlacedObjectMapImageUrlForAssetId } from '../../model/placedObjects/locationPlacedObjectRasterAssets';
import {
  getPlacedObjectMeta,
  parseLocationPlacedObjectKindId,
  resolvePersistedMapObjectKindMapImageUrl,
  resolvePlacedObjectVariant,
} from '../../model/placedObjects/locationPlacedObject.selectors';

export type PlacedObjectCellVisual = {
  /** Human-readable name (registry or map default). */
  label: string;
  /** Tooltip text — same as label unless we add descriptions later. */
  tooltip: string;
  /** Bundled map raster URL; null when manifest has no map slice (e.g. edge preview-only) or missing asset. */
  mapImageUrl: string | null;
  /** When true, render `mapImageUrl` as an image; otherwise show fallback letter. */
  showMapRaster: boolean;
  /** First character of `label` (uppercase) for fallback presentation. */
  fallbackLetter: string;
};

function fallbackLetterFromLabel(label: string): string {
  const t = label.trim();
  return t.length > 0 ? t.charAt(0).toUpperCase() : '?';
}

function mapObjectKindDefaultLabel(kind: LocationMapObjectKindId): string {
  return kind.length === 0 ? 'Object' : kind.charAt(0).toUpperCase() + kind.slice(1);
}

/** Runtime / tactical grid: `GridObject.authoredPlaceKindId` is always a registry id. */
export function resolvePlacedObjectCellVisualFromPlacedKind(
  placedKindId: LocationPlacedObjectKindId,
): PlacedObjectCellVisual {
  const meta = getPlacedObjectMeta(placedKindId);
  const { variant } = resolvePlacedObjectVariant(placedKindId, undefined);
  const mapImageUrl = getPlacedObjectMapImageUrlForAssetId(variant.assetId);
  const label = meta.label;
  return {
    label,
    tooltip: label,
    mapImageUrl,
    showMapRaster: mapImageUrl != null,
    fallbackLetter: fallbackLetterFromLabel(label),
  };
}

/**
 * Authoring / presentation: prefers `authoredPlaceKindId` when it parses to a registry kind;
 * otherwise uses persisted `LocationMapObjectKindId` → raster from registry defaults for that kind.
 */
export function resolvePlacedObjectCellVisualFromRenderItem(
  item: LocationMapAuthoredObjectRenderItem,
): PlacedObjectCellVisual {
  const parsed = parseLocationPlacedObjectKindId(item.authoredPlaceKindId);
  if (parsed) {
    const meta = getPlacedObjectMeta(parsed);
    const label = item.label?.trim() ? item.label.trim() : meta.label;
    const { variant } = resolvePlacedObjectVariant(parsed, undefined);
    const mapImageUrl = getPlacedObjectMapImageUrlForAssetId(variant.assetId);
    return {
      label,
      tooltip: label,
      mapImageUrl,
      showMapRaster: mapImageUrl != null,
      fallbackLetter: fallbackLetterFromLabel(label),
    };
  }

  const mapImageUrl = resolvePersistedMapObjectKindMapImageUrl(item.kind);
  const label = item.label?.trim() ? item.label.trim() : mapObjectKindDefaultLabel(item.kind);
  return {
    label,
    tooltip: label,
    mapImageUrl,
    showMapRaster: mapImageUrl != null,
    fallbackLetter: fallbackLetterFromLabel(label),
  };
}
