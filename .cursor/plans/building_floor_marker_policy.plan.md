# Plan: Building / floor map object policy + strict `marker` stance

## Goal

Align persisted map-object policy with location semantics:

- **`building`** is a **content type that composes floors**. It is **not** a tactical map object host.
- **`floor`** is the **tactical / interior authored map host** for discrete persisted cell objects (`LOCATION_MAP_OBJECT_KIND_IDS`).
- **`marker`** is for **annotation / point-of-interest semantics** on scales where that meaning is real (macro maps), **not** a freeform escape hatch on interior tactical maps.

## Desired policy outcome (persisted kinds)

In `shared/domain/locations/map/locationMapPlacement.policy.ts`, **`ALLOWED_MAP_OBJECT_KINDS_BY_HOST_SCALE`**:

| Host scale | Allowed persisted object kinds |
|------------|--------------------------------|
| **`building`** | **`[]`** — no map objects |
| **`floor`** | **`['obstacle', 'door', 'treasure', 'stairs']`** — **no `marker`** |

`marker` remains available only on host scales where POI / annotation semantics apply (e.g. **world**, **region**, **subregion**, **city**, **district**, **site**, **room** — per existing product rules; **not** building, **not** floor).

## 1. Policy stance (explicit)

- **`marker` on `floor` is intentionally removed.** It must not be kept as a vague custom placeholder. Interior tactical authoring should use **obstacle**, **door**, **treasure**, **stairs** (and links/edges/paint as defined elsewhere), not an overloaded `marker`.
- **`marker` on `building`** has no utility and is disallowed together with all other persisted object kinds (`building: []`).
- **Future floor “annotations”** (DM notes, labels, non-tactical pins) must **not** silently reuse `marker`. If needed, introduce a **separate annotation concept** (distinct type, storage, and UI). **Out of scope for this pass.**

## 2. Implementation consequences (must not leave policy and bridges misaligned)

### 2.1 Policy + tests

- Update `ALLOWED_MAP_OBJECT_KINDS_BY_HOST_SCALE` for `building` and `floor` as above.
- Update `shared/domain/locations/__tests__/map/locationMapPlacement.policy.test.ts` (today it asserts `building` allows `stairs`, etc.).

### 2.2 Bridge / mapping — **mandatory follow-through**

Removing `marker` from **`floor`** invalidates any path that persists **`kind: 'marker'`** for floor-placed content.

**Implementer checklist — inspect and report:**

1. **`mapPlacedObjectKindToPersistedMapObjectKind`**  
   - File: `src/features/content/locations/domain/mapEditor/placement/placeObjectBridge.ts`  
   - **Today:** `table` + `hostScale === 'floor'` → **`'marker'`** (Phase-1 stand-in).  
   - **Required:** map `table` (or equivalent placed kind) to a **persisted kind allowed on floor** — e.g. **`obstacle`** if “furniture / surface” is modeled that way — **or** drop `table` from the floor palette in `LOCATION_SCALE_MAP_CONTENT_POLICY` until a dedicated persisted kind exists. **Do not** leave `table → marker` while policy forbids `marker` on floor.

2. **Tests encoding `table → marker` on floor**  
   - `src/features/content/locations/domain/mapEditor/__tests__/placement/resolveLocationPlacedKindToAction.test.ts` — case *“table on floor maps to marker for Phase 1”* must change.

3. **`resolvePlacedKindToAction` / `resolveLocationPlacedKindToAction`**  
   - Files: `src/features/content/locations/domain/mapEditor/placement/resolvePlacedKindToAction.ts`  
   - Ensure resolved `objectKind` always passes **`canPlaceObjectKindOnHostScale(hostScale, objectKind)`** for floor (and building: none).

4. **Server validation**  
   - `server/features/content/locations/services/locationMaps.service.ts` — `validateCellAuthoringPolicy` uses **`locationScale` from the map’s location row**. If any map document is still keyed to **`scale === 'building'`**, cell objects will be validated with **`building: []`**. Confirm whether legacy maps-on-building exist; migrate or block at API if product requires “maps only on floors” for buildings.

5. **Authored metadata vs persisted `kind`**  
   - Persisted cells may store **`authoredPlaceKindId: 'table'`** with **`kind: 'marker'`** today. After policy change, new saves should use an allowed **`kind`** for floor; **`inferAuthoredPlaceKindFromMapCellObject`** (`src/features/game-session/combat/hydrateGridObjectsFromLocationMap.ts`) treats **`marker`/`door` without `authoredPlaceKindId`** as non-hydrating (`null`) — legacy rows may need migration or continued read-compat only.

### 2.3 UI / cell panels

- `LocationCellAuthoringPanel` uses `getAllowedObjectKindsForHostScale(hostScale)`. When `hostScale` is **`floor`** (including building workspace, which should pass **`floor`**), **`marker` must not appear** in add-object UI.

## 3. Building vs floor semantics (honest product story)

- **Building:** floor-composing parent; **not** a direct tactical object host in this policy layer.
- **Floor:** tactical/interior persisted object host for the listed kinds.

**Implementer: report** any remaining spots where **comments, validation, routes, or UI** still imply **`building`** directly hosts tactical cell objects or is the **map host** for object placement. Known areas to scan:

- `useLocationEditWorkspaceModel` / `LocationEditRoute` — `mapHostScaleResolved` / `mapHostLocationIdResolved` (should stay floor + active floor id for building workspace).
- Simulator copy: `SimulatorEncounterSetupSurface`, `SimulatorEncounterBuildingLocation` — ensure wording says **building selection** resolves to **floor** for tactical map (see `resolveSimulatorMapHostLocationId` in `encounterSpaceResolution.ts`).
- Any `mapKindForLocationScale` / map CRUD that allows **`encounter-grid`** on **`building`** — if product says buildings never hold maps, that may need a separate API guard (optional follow-up).

## 4. Future extensibility (out of scope)

- **Editor-only or DM-only freeform floor annotations** → design as a **separate annotation system** (not `marker` on floor). Document in backlog; do not implement in this pass.

---

## Appendix A: Where “marker on floor” is still implicitly assumed (pre-change)

| Area | Notes |
|------|--------|
| `locationMapPlacement.policy.ts` | `floor` includes `'marker'` today. |
| `placeObjectBridge.ts` | `table` on `floor` → persisted **`marker`**. |
| `resolveLocationPlacedKindToAction.test.ts` | Explicit test for **table → marker** on floor. |
| `.cursor/plans/map_editor_phase_1_toolbar_c2701fde.plan.md` | Phase-1 doc: table mapped to marker or new kind. |
| Tests / fixtures using **`kind: 'marker', authoredPlaceKindId: 'table'`** | e.g. `buildEncounterSpaceFromLocationMap.test.ts`, `cellAuthoringMappers.test.ts`, `locationMapAuthoredObjectRender.helpers.test.ts` — reflect **legacy or transitional** shape; update when persistence strategy changes. |

`hydrateGridObjectsFromLocationMap.inferAuthoredPlaceKindFromMapCellObject`: `marker` without stored `authoredPlaceKindId` → **`null`** (does not promote marker to a placed kind). **`table` + `authoredPlaceKindId`** is the path that matters for combat hydration.

## Appendix B: Helpers / bridges to call out by name

- **`mapPlacedObjectKindToPersistedMapObjectKind`** — `placeObjectBridge.ts` (critical for table/floor).
- **`resolvePlacedKindToAction`**, **`resolveLocationPlacedKindToAction`** — `resolvePlacedKindToAction.ts`.
- **`canPlaceObjectKindOnHostScale`**, **`getAllowedObjectKindsForHostScale`** — `locationMapPlacement.policy.ts`.
- **`validateCellAuthoringPolicy`** — `locationMaps.service.ts` (server).
- **`inferAuthoredPlaceKindFromMapCellObject`**, **`buildGridObjectsFromLocationMapCellEntries`** — `hydrateGridObjectsFromLocationMap.ts`.
- **`LOCATION_SCALE_MAP_CONTENT_POLICY`**, **`getAllowedPlacedObjectKindsForScale`** — `locationScaleMapContent.policy.ts` (editor palette vocabulary; must stay consistent with bridge + placement policy).

## Appendix C: Risk notes (misalignment after policy-only change)

1. **Policy vs bridge:** If only `ALLOWED_MAP_OBJECT_KINDS_BY_HOST_SCALE` changes, **floor** table placement may still persist **`marker`** → **server rejects** save or **client** shows allowed kinds without marker but placement still emits marker → **broken UX**.
2. **Policy vs legacy data:** Existing maps with **`kind: 'marker'`** on floor cells may **fail validation** on next save unless migrated or grandfathered.
3. **Building-scale map rows:** If maps exist with **`locationId`** = building and cell objects, **`building: []`** makes those objects **invalid** — needs migration or map host rule change.
4. **Two vocabularies:** `LOCATION_PLACED_OBJECT_KIND_IDS` (table, tree, …) vs `LOCATION_MAP_OBJECT_KIND_IDS` (marker, obstacle, …) — **bridge must stay the single translation** for persisted `kind`; changing marker on floor forces **bridge + palette** alignment, not policy alone.

---

## Completion criteria for this pass

- [ ] `building: []`, `floor: ['obstacle', 'door', 'treasure', 'stairs']` in placement policy.
- [ ] Tests updated; no test assumes marker on floor for **new** behavior unless explicitly legacy-compat.
- [ ] **placeObjectBridge** (and any other floor → persisted mapping) updated so **no floor save emits `marker`**.
- [ ] Short **implementer report**: remaining comments/UI/server assumptions about building as tactical object host; any follow-up tickets listed.
