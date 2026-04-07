import type { LocationMapEdgeAuthoringEntry, LocationMapEdgeKindId } from '@/shared/domain/locations';

import {
  isVariantIdValidForFamily,
  parseLocationPlacedObjectKindId,
  type LocationPlacedObjectKindId,
} from '@/features/content/locations/domain/model/placedObjects/locationPlacedObject.types';

/**
 * Registry-aware normalization for persisted edge rows (save pipeline).
 *
 * @see `./locationMapEdgeAuthoring.policy.md` — wall vs door/window, coarse vs authored consumers, run-group limits.
 *
 * **Door/window authored bundle:** `authoredPlaceKindId` + `variantId` are persisted **together** or **not at all**
 * (after salvage). If registry `authoredPlaceKindId` is present but `variantId` is missing/invalid, **both** are
 * removed → coarse opening row (`kind` + optional `label` / `state`). If `kind` is door/window with a **valid**
 * `variantId` but no authored id, **`authoredPlaceKindId` is backfilled** from `kind` to complete the bundle.
 */
export function normalizeEdgeAuthoringEntryForPersistence(
  entry: LocationMapEdgeAuthoringEntry,
): LocationMapEdgeAuthoringEntry {
  let kind: LocationMapEdgeKindId = entry.kind;
  let authoredPlaceKindId = entry.authoredPlaceKindId;
  let variantId = entry.variantId;

  const trimmedAuthored =
    authoredPlaceKindId != null && String(authoredPlaceKindId).trim() !== ''
      ? String(authoredPlaceKindId).trim()
      : undefined;

  const parsedAuthored = parseLocationPlacedObjectKindId(trimmedAuthored ?? null);

  if (parsedAuthored === 'door' || parsedAuthored === 'window') {
    kind = parsedAuthored;
  }

  if (trimmedAuthored !== undefined) {
    if (parsedAuthored == null) {
      authoredPlaceKindId = undefined;
    } else {
      authoredPlaceKindId = trimmedAuthored;
    }
  } else {
    authoredPlaceKindId = undefined;
  }

  const familyFromCoarse: LocationPlacedObjectKindId | null =
    kind === 'door' || kind === 'window' ? kind : null;
  const family: LocationPlacedObjectKindId | null =
    parseLocationPlacedObjectKindId(authoredPlaceKindId) ?? familyFromCoarse;

  if (family != null && variantId != null && variantId !== '') {
    if (!isVariantIdValidForFamily(family, variantId)) {
      variantId = undefined;
    }
  } else if (variantId != null && family == null) {
    variantId = undefined;
  }

  const hasRegistryAuthored =
    parseLocationPlacedObjectKindId(authoredPlaceKindId) === 'door' ||
    parseLocationPlacedObjectKindId(authoredPlaceKindId) === 'window';

  const variantClean = variantId != null && variantId !== '' ? variantId : undefined;

  if (kind === 'wall') {
    authoredPlaceKindId = undefined;
    variantId = undefined;
  } else if (kind === 'door' || kind === 'window') {
    const famAuthored = parseLocationPlacedObjectKindId(authoredPlaceKindId);
    const openingFamily: LocationPlacedObjectKindId | null =
      famAuthored === 'door' || famAuthored === 'window' ? famAuthored : kind;

    const variantOkForOpening =
      variantClean != null &&
      openingFamily != null &&
      (openingFamily === 'door' || openingFamily === 'window') &&
      isVariantIdValidForFamily(openingFamily, variantClean);

    if (hasRegistryAuthored && !variantOkForOpening) {
      authoredPlaceKindId = undefined;
      variantId = undefined;
    } else if (!hasRegistryAuthored && variantOkForOpening) {
      authoredPlaceKindId = kind;
      variantId = variantClean;
    } else if (!hasRegistryAuthored && variantClean != null && !variantOkForOpening) {
      variantId = undefined;
    }
  }

  const label =
    entry.label != null && String(entry.label).trim() !== '' ? String(entry.label).trim() : undefined;

  return {
    edgeId: entry.edgeId,
    kind,
    ...(authoredPlaceKindId !== undefined ? { authoredPlaceKindId } : {}),
    ...(variantId != null && variantId !== '' ? { variantId } : {}),
    ...(label ? { label } : {}),
    ...(entry.state !== undefined ? { state: entry.state } : {}),
  };
}

export function normalizeEdgeAuthoringEntriesForPersistence(
  entries: readonly LocationMapEdgeAuthoringEntry[],
): LocationMapEdgeAuthoringEntry[] {
  return entries.map(normalizeEdgeAuthoringEntryForPersistence);
}
