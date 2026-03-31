---
name: Location map authoring follow-up
overview: Post-cutover cleanup—remove deprecated shared *_FEATURE_* aliases, normalize pathEntries/edgeEntries to empty arrays at API boundaries and tighten types, and define the next geometry pass as pure authored→render-data helpers while keeping pathEntriesToSvgPaths as an explicit temporary seam.
todos:
  - id: remove-feature-aliases
    content: Remove LOCATION_MAP_PATH_FEATURE_* / LOCATION_MAP_EDGE_FEATURE_* aliases from shared constants; migrate LocationGridAuthoringSection (and any remaining imports) to LocationMapPathKindId / LOCATION_MAP_PATH_KIND_IDS; verify grep clean
    status: pending
  - id: normalize-empty-arrays
    content: "Normalize pathEntries/edgeEntries to [] in server toDoc and client map load; then make pathEntries + edgeEntries required on LocationMapBase (or document NormalizedLocationMap) and delete redundant ?? [] at call sites"
    status: pending
  - id: protect-render-seam
    content: "Add file/function JSDoc on pathOverlayRendering: pathEntriesToSvgPaths is temporary bridge; extract pathEntriesToCenterlinePoints (cellIds→points, no SVG) in shared or domain; keep Catmull-Rom only in feature layer"
    status: pending
  - id: geometry-pass-spec
    content: "Document next pass deliverables—pathEntries→segment pairs or polyline points; edgeEntries→boundary segment descriptors; shared cell-center + edge-boundary lookup; pathEntriesToSvgPaths calls shared helpers only"
    status: pending
isProject: false
---

# Location map authoring — follow-up plan

The canonical model cutover (`pathEntries` / `edgeEntries`, chain `cellIds`, edge `edgeId` + `kind`) is implemented. This plan covers **cleanup**, **boundary normalization**, and the **next geometry extraction pass** (helpers only, not full UI components).

---

## 1. Deprecated `*_FEATURE_*` aliases (temporary churn reducer)

**Problem:** Shared [`locationMapPathFeature.constants.ts`](shared/domain/locations/map/locationMapPathFeature.constants.ts) and [`locationMapEdgeFeature.constants.ts`](shared/domain/locations/map/locationMapEdgeFeature.constants.ts) export `LOCATION_MAP_PATH_FEATURE_KIND_IDS` / `LocationMapPathFeatureKindId` as aliases. They blur canonical naming if left indefinitely.

**Current usage:** [`LocationGridAuthoringSection.tsx`](src/features/content/locations/components/LocationGridAuthoringSection.tsx) still imports `LocationMapPathFeatureKindId` from the path constants file.

**Note:** Feature-layer types [`LocationPathFeatureKindId`](src/features/content/locations/domain/mapContent/locationPathFeature.types.ts) / [`LocationEdgeFeatureKindId`](src/features/content/locations/domain/mapContent/locationEdgeFeature.types.ts) are **separate** (UI meta, palette)—not the same as removing shared aliases; align naming in a later pass if desired.

**Tasks:**

1. Replace imports in `LocationGridAuthoringSection` with `LocationMapPathKindId` / `LOCATION_MAP_PATH_KIND_IDS` from the same file (canonical names).
2. `rg` for `LOCATION_MAP_PATH_FEATURE|LOCATION_MAP_EDGE_FEATURE|LocationMapPathFeatureKindId|LocationMapEdgeFeatureKindId` under `shared/domain/locations/map/`.
3. Delete the deprecated re-exports from both constant files once nothing imports them.
4. Optional: one-line `@deprecated` JSDoc on aliases **only if** you need one more release cycle before deletion.

---

## 2. `pathEntries` / `edgeEntries` optionality vs empty arrays

**Problem:** [`LocationMapBase`](shared/domain/locations/map/locationMap.types.ts) has `pathEntries?` and `edgeEntries?`. Call sites use `def.pathEntries ?? []`. Optional spreads “undefined vs empty” through the system.

**Target:** At **boundaries** (server `toDoc`, client immediately after fetch), normalize missing/invalid to **`[]`**. Then callers can assume arrays exist.

**Tasks:**

1. **[`locationMaps.service.ts`](server/features/content/locations/services/locationMaps.service.ts) `toDoc`:**  
   `pathEntries: Array.isArray(doc.pathEntries) ? doc.pathEntries : []` (same for `edgeEntries`).
2. **Client:** After `listLocationMaps` / default map resolution in [`LocationEditRoute.tsx`](src/features/content/locations/routes/LocationEditRoute.tsx) (or a small `normalizeMapFromApi(map)` helper), ensure the object passed into draft state always has arrays.
3. **Types:** When all producers/consumers are updated, change `LocationMapBase` to **required** `pathEntries: LocationMapPathAuthoringEntry[]` and `edgeEntries: LocationMapEdgeAuthoringEntry[]` (default `[]` at boundaries only—Mongo may still omit keys; normalization fixes the type story).
4. Remove redundant `?? []` where the type guarantees arrays.

**Leave `cellEntries` optional** unless product wants sparse vs empty spelled the same way everywhere.

---

## 3. Protect `pathEntriesToSvgPaths` as the temporary rendering seam

**Problem:** [`pathEntriesToSvgPaths`](src/features/content/locations/components/pathOverlayRendering.ts) is the bridge from authored data to SVG. It risks becoming permanent “architecture” if more logic piles in.

**Rules for this function:**

- **Allowed:** Map `pathEntries` → pixel points via `centerFn` → `chainToSmoothSvgPath` → `{ kind, d }[]`.
- **Not allowed here:** New grid math, hex policy, or persistence concerns.

**Next refactor inside the same file (small):**

1. Extract **`pathEntriesToCenterlinePoints`** (or `pathEntryToCenterlinePoints`): `LocationMapPathAuthoringEntry` + `CenterFn` → `{ cx; cy }[][]` or single chain—**no SVG, no Catmull-Rom**.
2. Keep **`pathEntriesToSvgPaths`** as: `points chains → chainToSmoothSvgPath` only, with a comment: *Temporary seam until detail view and editor share the same authored→points pipeline.*

Optional: move the pure “cellIds → points” step to **`shared/domain/locations/map/`** if encounter/detail views need it without importing React.

---

## 4. Next pass — authored → render-data helpers (not full components)

**Scope:** Pure functions and shared lookups, **not** new React components.

| Deliverable | Role |
|-------------|------|
| **pathEntries → segments or polyline points** | Adjacent cell-id pairs and/or ordered pixel/control points for polylines. |
| **edgeEntries → boundary segments** | From `edgeId` + grid dimensions → segment endpoints (reuse / extend [`squareEdgeSegmentPxFromEdgeId`](src/features/content/locations/components/squareGridMapOverlayGeometry.ts) patterns; hex later). |
| **Cell center lookup** | Single helper: `cellId` + grid layout → `{ cx, cy }` (square + hex), usable from editor and read-only map views. |
| **Edge boundary lookup** | Canonical `edgeId` → segment in pixel space (square first). |

**End state:** `pathEntriesToSvgPaths` becomes a thin caller of **shared authored→points** + existing `chainToSmoothSvgPath` in the feature layer.

---

## 5. Relationship to the original plan

The original [map_authoring_model_split plan](map_authoring_model_split_112d3dc2.plan.md) described the cutover; several items there are **done** (no legacy path migration per product decision). This follow-up plan supersedes “legacy normalization” and “dual schema” sections for ongoing work.

---

## 6. Tests to add or extend

- Unit test: `toDoc` returns `[]` for missing `pathEntries` / `edgeEntries`.
- After alias removal: no references to `*_FEATURE_*` in shared map constants.
- Optional: `pathEntriesToCenterlinePoints` pure tests (cell ids in → points out with mock `centerFn`).

---

## 7. Docs

- Short paragraph in [`docs/reference/location-workspace.md`](docs/reference/location-workspace.md) or [`locations.md`](docs/reference/locations.md): canonical kind names on the wire (`LOCATION_MAP_*_KIND_IDS`), and that `pathEntriesToSvgPaths` is an editor seam until shared geometry helpers land.
