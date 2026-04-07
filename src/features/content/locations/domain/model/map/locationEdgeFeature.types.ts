/**
 * Edge feature kinds: content on **cell boundaries** (walls, windows, doors).
 *
 * **Coarse vs authored (door/window):**
 * - **`kind`** (`wall` | `door` | `window`) is the persisted coarse lane for `edgeEntries`, geometry, combat, SVG strokes, and draw policy.
 * - **`wall`** — draw-tool / coarse boundary paint; see {@link LOCATION_EDGE_FEATURE_KIND_META} for draw-palette copy only.
 * - **`door` / `window`** — authored-object semantics (variants, presentation, labels) live in **`AUTHORED_PLACED_OBJECT_DEFINITIONS`**
 *   and **`resolveAuthoredEdgeInstance`**; instance state will live on **`LocationMapEdgeAuthoringEntry.state`** when shipped — **not** in this meta map.
 *
 * **Structured facet types** (`LocationEdgeMaterialId`, etc.) remain in `shared/.../locationEdgeFeature.facets.ts` for future wall material
 * or typed state; they are **not** duplicated as `supported*` lists on {@link LOCATION_EDGE_FEATURE_KIND_META}.
 */

import type { LocationEdgeFeatureCategory, LocationEdgeMaterialId } from '@/shared/domain/locations/map/locationEdgeFeature.facets';

import type { LocationMapEdgeKindId } from '@/shared/domain/locations/map/locationMapEdgeFeature.constants';

/** Re-export facet vocabularies for callers that need them (e.g. future wall material UI). */
export type {
  LocationDoorLockStateId,
  LocationDoorWidthId,
  LocationEdgeFeatureCategory,
  LocationEdgeMaterialId,
  LocationWindowVariantId,
} from '@/shared/domain/locations/map/locationEdgeFeature.facets';

export { LOCATION_EDGE_MATERIAL_IDS } from '@/shared/domain/locations/map/locationEdgeFeature.facets';

/** Same union as {@link LocationMapEdgeKindId} — shared `LOCATION_MAP_EDGE_KIND_IDS` is the id source. */
export type LocationEdgeFeatureKindId = LocationMapEdgeKindId;

export { LOCATION_MAP_EDGE_KIND_IDS as LOCATION_EDGE_FEATURE_KIND_IDS } from '@/shared/domain/locations/map/locationMapEdgeFeature.constants';

/**
 * **Coarse** authoring metadata per base edge `kind` — labels/descriptions for tools that list kinds without the
 * placed-object registry (today: **draw edge palette** via {@link getDrawEdgePaletteItemsForScale}).
 *
 * Door/window **variant**, lock, and instance semantics belong in the registry + persisted edge row — not here.
 */
export type LocationEdgeFeatureKindMeta = {
  label: string;
  description?: string;
  /**
   * Optional grouping for future edge browser / filters.
   * @remarks Not read by current editor chrome.
   */
  edgeCategory?: LocationEdgeFeatureCategory;
  /**
   * Declared materials for `wall` when per-edge material is added to the model (coarse wall concern).
   * @remarks Not stored on `LocationMapEdgeAuthoringEntry` yet.
   */
  supportedMaterials?: readonly LocationEdgeMaterialId[];
};

/**
 * Per-kind copy for **coarse** edge features. Keys match {@link LOCATION_MAP_EDGE_KIND_IDS}.
 *
 * Door/window entries are **minimal** (label/description/category only) for policy-complete `Record` typing and any
 * scale that lists those kinds in draw policy; **place** tool + inspectors use the authored-object registry instead.
 */
export const LOCATION_EDGE_FEATURE_KIND_META = {
  wall: {
    label: 'Wall',
    description: 'Solid boundary between cells.',
    edgeCategory: 'barrier',
    supportedMaterials: ['stone', 'wood'] as const,
  },
  window: {
    label: 'Window',
    description: 'Opening in a wall.',
    edgeCategory: 'opening',
  },
  door: {
    label: 'Door',
    description: 'Passage or threshold on an edge.',
    edgeCategory: 'passage',
  },
} as const satisfies Record<LocationEdgeFeatureKindId, LocationEdgeFeatureKindMeta>;
