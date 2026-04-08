# System location placed-object raster assets (Phase 1)

## Strategy: **Option A — single manifest**

- **Generated file:** [`location-objects.manifest.json`](location-objects.manifest.json) — one JSON document per build.
- **`assetId`:** Derived from the PNG filename stem: `kebab-case` → `snake_case` (e.g. `door-single-wood.png` → `door_single_wood`). Stable across art swaps; registry references **ids**, not raw filenames.
- **Roles per asset:**
  - **`map`:** Raster slice for **cell**-placed objects (stairs, table, treasure). **Omitted (`null`)** for **edge** (`door` / `window`) families — those stay **vector** on the map until a later phase.
  - **`preview`:** Always set for every PNG — used for the **place palette / toolbar tray** (Phase 2+).
- **`slice` fields:** `intrinsicSize` (full image), `trim` (transparent-bounding box from generated alpha scan). **No hand-maintained `trimPx`.**

## Author mapping

- [`variantToAssetId.json`](variantToAssetId.json) maps **registry family** `{family}.{variant}` → **`assetId`** or `null` when art is not yet available.
- **`unregisteredAssetIds`:** optional list of manifest **`assetId`** keys not yet tied to a registry variant (keep empty when everything is mapped).

## Commands

| Script | Purpose |
|--------|---------|
| `npm run build:location-objects-manifest` | Regenerate `location-objects.manifest.json` from `*.png` files. |
| `npm run validate:location-objects-manifest` | Assert manifest + `variantToAssetId.json` consistency. |
| `npm run build:location-objects` | Generate then validate (runs on `npm run build`). |

After adding or replacing a PNG, run **`build:location-objects-manifest`** and commit the updated manifest (`contentSha256`, trim, and **`inputFingerprint`** change when bytes change).

## Implementation

- Generator: `scripts/location-objects-assets/generateLocationObjectsManifest.ts`
- Validator: `scripts/location-objects-assets/validateLocationObjectsManifest.ts`
- Shared types: `shared/domain/locations/map/locationObjectsAssetManifest.types.ts`

## Phase 2 (application)

- **Registry** (`AUTHORED_PLACED_OBJECT_DEFINITIONS`) uses **`assetId`** per variant (no `iconName`).
- **Runtime resolution:** `src/features/content/locations/domain/model/placedObjects/locationPlacedObjectRasterAssets.ts` — Vite `import.meta.glob` of `*.png` + manifest for preview/map URLs.
- **Place palette / tray:** `previewImageUrl` on palette items; **in-map cell objects:** `<img>` via `resolvePlacedObjectCellVisual` + `PlacedObjectCellVisualDisplay`. **Edge** doors/windows still draw as vector segments on the map; tray uses preview PNGs only.

## Phase 4 (table pilot — sprite fit)

- **Footprint box** comes from Phase 3 registry **`footprint`** (feet) + grid **`cellUnit`** → pixel layout (`resolvePlacedObjectFootprintLayoutPx`).
- **In-map raster** is drawn with **`object-fit: contain`** (`PLACED_OBJECT_MAP_SPRITE_OBJECT_FIT` in `placedObjectMapSprite.constants.ts`) inside that box so **art is never non-uniformly stretched**. If aspect ratios differ, letterboxing is expected—**do not** “fix” by stretching; add or swap PNGs and keep **one variant = one `assetId` + footprint** (e.g. 10×4 ft table uses `table_rect_wood_10x4`, not a scaled 5×3 asset).
- **CI:** `locationObjectsTableRegistryManifest.crossReference.test.ts` asserts every **`table`** variant `assetId` (except the shared placeholder) has **`map`** + **`preview`** in `location-objects.manifest.json`.
