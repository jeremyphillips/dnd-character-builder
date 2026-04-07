/**
 * @file **Authored-identity** hydration for edge rows (see `locationMapEdgeAuthoring.policy.md`).
 *
 * **Policy:** Any UI or logic that must reflect persisted `authoredPlaceKindId` / `variantId` / presentation for
 * door/window must use this module — **coarse** consumers use only `edgeId` + `kind` (geometry, combat, SVG underlay).
 *
 * ## Follow-up
 * - **`state`** — bind discriminated `LocationMapEdgeAuthoringState` when editor/gameplay fields ship.
 * - **Cell `variantId` parity** — optional `variantId` on cell objects using the same registry patterns as edge rows.
 */

import type { LocationMapEdgeAuthoringEntry } from '@/shared/domain/locations';

import {
  getPlacedObjectPaletteCategoryId,
  getPlacedObjectPaletteCategoryLabel,
  LOCATION_PLACED_OBJECT_KIND_META,
  parseLocationPlacedObjectKindId,
  resolvePlacedObjectVariant,
  type LocationPlacedObjectKindId,
} from '@/features/content/locations/domain/model/placedObjects/locationPlacedObject.types';
import type { AuthoredPlacedObjectVariantPresentation } from '@/features/content/locations/domain/model/placedObjects/locationPlacedObject.registry';

/**
 * Single hydration / precedence path for edge-authored instances (inspector, metadata, previews).
 * Coarse `kind` is used only when authored identity is absent (legacy rows).
 */
export type ResolvedAuthoredEdgeInstance = {
  /** Persisted coarse kind (always set). */
  edgeKind: LocationMapEdgeAuthoringEntry['kind'];
  /** Registry family when this edge is a door/window authored object. */
  placedKind: LocationPlacedObjectKindId | null;
  /** Resolved variant id (persisted or registry default). */
  variantId: string;
  label: string | undefined;
  /** Presentation rows source — concrete variant when identity resolves to a family. */
  presentation: AuthoredPlacedObjectVariantPresentation | undefined;
  /**
   * True when the row is legacy door/window data with only coarse `kind` (no persisted authored identity).
   */
  legacyIdentityFallback: boolean;
  objectTitle: string;
  categoryLabel: string;
};

export function resolveAuthoredEdgeInstance(entry: LocationMapEdgeAuthoringEntry): ResolvedAuthoredEdgeInstance {
  const parsedAuthored = parseLocationPlacedObjectKindId(entry.authoredPlaceKindId);
  const fromKind: LocationPlacedObjectKindId | null =
    entry.kind === 'door' || entry.kind === 'window' ? entry.kind : null;
  const placedKind: LocationPlacedObjectKindId | null = parsedAuthored ?? fromKind;

  const legacyIdentityFallback =
    (entry.kind === 'door' || entry.kind === 'window') &&
    entry.authoredPlaceKindId == null &&
    entry.variantId == null;

  if (placedKind === 'door' || placedKind === 'window') {
    const { resolvedVariantId: variantId, variant } = resolvePlacedObjectVariant(placedKind, entry.variantId);
    const presentation = variant.presentation;
    const variantLabel = variant.label;
    const objectTitle =
      variantLabel ?? LOCATION_PLACED_OBJECT_KIND_META[placedKind].label;
    const categoryLabel = getPlacedObjectPaletteCategoryLabel(
      getPlacedObjectPaletteCategoryId(placedKind),
    );
    return {
      edgeKind: entry.kind,
      placedKind,
      variantId,
      label: entry.label?.trim() || undefined,
      presentation,
      legacyIdentityFallback,
      objectTitle,
      categoryLabel,
    };
  }

  return {
    edgeKind: entry.kind,
    placedKind: null,
    variantId: '',
    label: entry.label?.trim() || undefined,
    presentation: undefined,
    legacyIdentityFallback: false,
    objectTitle: 'Wall',
    categoryLabel: 'Structure',
  };
}
