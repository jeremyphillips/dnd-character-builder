// @vitest-environment node
/**
 * Phase 4 — content test: **`table`** registry `assetId`s resolve to manifest rows with required slices.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { AUTHORED_PLACED_OBJECT_DEFINITIONS } from '../locationPlacedObject.registry';
import { PLACEHOLDER_NO_ART_ASSET_ID } from '../locationPlacedObjectRasterAssets.core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** `placedObjects/__tests__` → repo root (8 parents). */
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '..', '..');
const MANIFEST_PATH = path.join(REPO_ROOT, 'assets/system/locations/objects/location-objects.manifest.json');

type ManifestV1 = {
  schemaVersion: number;
  assets: Record<
    string,
    {
      map: unknown;
      preview: unknown;
    }
  >;
};

describe('table family registry ↔ location-objects.manifest.json', () => {
  const manifest: ManifestV1 = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  const table = AUTHORED_PLACED_OBJECT_DEFINITIONS.table;

  it('every table variant assetId exists in the manifest', () => {
    for (const v of Object.values(table.variants)) {
      expect(manifest.assets[v.assetId], `missing manifest asset: ${v.assetId}`).toBeDefined();
    }
  });

  it('non-placeholder table map sprites require map + preview slices', () => {
    for (const [variantId, v] of Object.entries(table.variants)) {
      if (v.assetId === PLACEHOLDER_NO_ART_ASSET_ID) continue;
      const asset = manifest.assets[v.assetId];
      expect(asset?.map, `${variantId}: map slice required for ${v.assetId}`).toBeTruthy();
      expect(asset?.preview, `${variantId}: preview slice required for ${v.assetId}`).toBeTruthy();
    }
  });
});
