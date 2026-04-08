---
name: Door state authoring
overview: Add optional doorState as authoritative door behavioral state; shared helpers plus predicate; strip doorState when a row ceases to be a door (draft and normalize); encounter door edges derive movement/LOS only from open/closed; lockState persisted and editable in UI but not encounter mechanics yet; Selection fields in fields/ with local coercion; anchor-only edge-run edits.
todos:
  - id: phase-a-types-persist
    content: AuthoredDoor* types, doorState on entry, resolve/sanitize, shared door-instance predicate, normalize + draft paths clear doorState when not door
    status: pending
  - id: phase-b-encounter
    content: resolveDoorRuntimeFromState — movement/LOS only for encounter door edges (lockState out of scope for mechanics)
    status: pending
  - id: phase-c-ui
    content: DoorStateFields emits sanitized state (coercion visible); edge-run anchor-only semantics documented; widen patches + resolveAuthoredEdgeInstance
    status: pending
  - id: phase-d-tests
    content: Unit + buildEncounterSpace + selection/round-trip tests
    status: pending
isProject: false
---

# Door open/lock state on edge entries

## Context from the codebase

- **`doorState` is authoritative** for door **behavioral** authoring in this pass. Existing **`state?: LocationMapEdgeAuthoringState`** ([`locationMapEdgeAuthoring.types.ts`](shared/domain/locations/map/locationMapEdgeAuthoring.types.ts)) stays **reserved for other/future edge concerns**; **do not read `state` for door open/lock** (no branching on `state.family === 'door'` for this feature).
- [`LocationMapEdgeAuthoringEntry`](shared/domain/locations/map/locationMap.types.ts) gains `doorState?: AuthoredDoorState` as a **separate** field; do **not** fold open/lock into variants.
- [`buildEncounterSpaceFromLocationMap`](src/features/game-session/combat/buildEncounterSpaceFromLocationMap.ts) builds [`EncounterEdge`](packages/mechanics/src/combat/space/space.types.ts) from **coarse `kind` only** today. For `door` it currently sets **`blocksMovement: false`, `blocksSight: false`** (always passable). After this work, **missing `doorState` resolves to closed**, so those edges will **block** like the door family's registry baseline—matching [`locationPlacedObject.registry.ts`](src/features/content/locations/domain/model/placedObjects/locationPlacedObject.registry.ts). **`open` + resolved state** clears blocking on the edge.
- **Shared predicate:** Add a small **single** helper (e.g. `isLocationMapEdgeEntryDoorInstance(entry): boolean`, name TBD) that encodes “this row resolves to a **door** instance” using the **same rules** as [`resolveAuthoredEdgeInstance`](src/features/content/locations/domain/authoring/map/locationMapEdgeAuthoring.resolve.ts) / kind+authored alignment—use it in **normalization**, **inspector hydration**, and **encounter build** so the three do not drift. Implementation can delegate to one canonical resolver or duplicate minimal logic with a shared test matrix.
- [`normalizeEdgeAuthoringEntryForPersistence`](src/features/content/locations/domain/authoring/map/locationMapEdgeAuthoring.normalize.ts) passes through (and sanitizes) `doorState` for door rows; [`buildEdgeAuthoringEntryForStroke`](src/features/content/locations/domain/authoring/editor/edge/edgeAuthoring.ts) must **preserve** `doorState` when the row **stays** a door, and **omit/clear** it as soon as the row **stops** being a door (see Phase A).
- [`resolveAuthoredEdgeInstance`](src/features/content/locations/domain/authoring/map/locationMapEdgeAuthoring.resolve.ts) remains the single presentation hydration path—extend with **effective door state** when the instance is a door.
- Patch pipeline: [`handlePatchEdgeEntry`](src/features/content/locations/routes/locationEdit/useLocationEditWorkspaceModel.ts) and [`SelectionTab`](src/features/content/locations/components/workspace/rightRail/tabs/selection/SelectionTab.tsx) widen beyond `label` to include `doorState`.

## Phase A — Data model and persistence

1. **Shared types** (new file, e.g. [`shared/domain/locations/map/locationMapDoorAuthoring.types.ts`](shared/domain/locations/map/locationMapDoorAuthoring.types.ts)):
   - `AuthoredDoorOpenState`, `AuthoredDoorLockState`, `AuthoredDoorState` (`openState?`, `lockState?`).
   - Export from [`shared/domain/locations`](shared/domain/locations/index.ts) (or existing map barrel) for app + tests.

2. **Extend** [`LocationMapEdgeAuthoringEntry`](shared/domain/locations/map/locationMap.types.ts) with `doorState?: AuthoredDoorState` (only meaningful when the row is a **door** instance; ignored elsewhere).

3. **Helpers** (shared, e.g. `locationMapDoorAuthoring.helpers.ts` next to types):
   - **`isLocationMapEdgeEntryDoorInstance(entry)`** (or equivalent): stable predicate for “door instance” — use in normalize, encounter edge build, and any guard that must match inspector semantics.
   - `resolveAuthoredDoorState(state)` → `Required<AuthoredDoorState>` with defaults **`closed` / `unlocked`**.
   - `sanitizeAuthoredDoorState(state)` → same shape, enforcing: **`barred` ⇒ `openState: 'closed'`**; if **`openState === 'open'`** then **`lockState !== 'barred'`** (coerce barred → `unlocked` deterministically).

4. **Strip `doorState` as soon as the row is no longer a door** (not only at save):
   - **Normalize** [`normalizeEdgeAuthoringEntryForPersistence`](src/features/content/locations/domain/authoring/map/locationMapEdgeAuthoring.normalize.ts): strip `doorState` when the normalized row is not a door; sanitize when it is.
   - **Stroke / replace** [`buildEdgeAuthoringEntryForStroke`](src/features/content/locations/domain/authoring/editor/edge/edgeAuthoring.ts) (and any other draft mutation that changes `kind` or authored identity): when the resulting row is **wall**, **window**, or otherwise **not** a door instance, **omit `doorState`** from the produced object. When it remains a **door**, carry forward **`doorState`** (and existing **`state`** if present) from `existing` where appropriate.
   - Audit other edge draft writers (erase, bulk replace) for the same rule.

5. **Docs / policy** (small, targeted): update [`locationMapEdgeAuthoring.policy.md`](src/features/content/locations/domain/authoring/map/locationMapEdgeAuthoring.policy.md): authoritative **`doorState`** vs stub **`state`**; coarse consumer note for **`buildEncounterSpaceFromLocationMap`** (door edges read **`doorState`** for tactical blocking only—see Phase B scope).

## Phase B — Effective runtime and encounter wiring

**Scope (this pass):** Change **only** effective **movement and line-of-sight blocking** on **encounter** edges for **door** segments, derived from **`doorState`** (via open vs closed). **`lockState`** is **persisted** and **editable in UI** but **does not** drive encounter interactions, prompts, permissions, or any other mechanics yet—treat as data for future work.

6. **Resolver** in locations domain (e.g. [`locationPlacedObject.runtime.ts`](src/features/content/locations/domain/model/placedObjects/locationPlacedObject.runtime.ts) or adjacent `doorRuntime.ts`):
   - `resolveDoorRuntimeFromState(baseRuntime: AuthoredPlacedObjectRuntimeFields, doorState: AuthoredDoorState | undefined): AuthoredPlacedObjectRuntimeFields`
   - `baseRuntime` = `resolveLocationPlacedObjectKindRuntimeDefaults('door')` (closed baseline).
   - After `effective = sanitizeAuthoredDoorState(doorState)`: if **`openState === 'open'`** → set **`blocksMovement: false`**, **`blocksLineOfSight: false`** on the output; closed uses **`baseRuntime`** blocking. **Do not** branch on **`lockState`** for blocking in this pass.

7. **Encounter build**: change [`buildEncounterSpaceFromLocationMap`](src/features/game-session/combat/buildEncounterSpaceFromLocationMap.ts) so the edge loop uses the **predicate** (or equivalent) for door rows and passes **`entry.doorState`** into `resolveDoorRuntimeFromState` for **`EncounterEdge.blocksMovement` / `blocksSight`**.
   - For **`wall`** / **`window`** → keep current `edgeToEncounterEdge` behavior (unchanged).

8. **Exports**: re-export resolver from the same public surface as other placed-object runtime helpers if tests or game-session import from a barrel.

## Phase C — Workspace Selection UI

**Field placement:** All editable Selection-rail field UI for this feature lives under [`rightRail/tabs/selection/fields/`](src/features/content/locations/components/workspace/rightRail/tabs/selection/fields/) (same home as [`edgeLabelField`](src/features/content/locations/components/workspace/rightRail/tabs/selection/fields/edgeLabelField.tsx), stair fragments, etc.). Inspectors **import** these components and compose them under [`SelectionRailTemplate`](src/features/content/locations/components/workspace/rightRail/tabs/selection/templates/SelectionRailTemplate.tsx); do **not** implement door open/lock controls inline inside inspector files.

9. **New component** [`DoorStateFields.tsx`](src/features/content/locations/components/workspace/rightRail/tabs/selection/fields/DoorStateFields.tsx) in that **fields** folder (MUI **Select**s, not toggles):
   - On user edits, **emit sanitized/coerced** `AuthoredDoorState` (e.g. barred + open → coerced combination) so invalid combos are **fixed in the UI layer** and the parent receives canonical state. **`sanitizeAuthoredDoorState` in persistence remains a backstop** for legacy or API-shaped payloads—not the only line of defense.

10. **Inspectors** ([`LocationMapEdgeInspectors.tsx`](src/features/content/locations/components/workspace/rightRail/tabs/selection/inspectors/LocationMapEdgeInspectors.tsx) — thin composition only): edge and **edge-run** inspector:
    - When the resolved instance is a door, render `<DoorStateFields />` (from **fields**) as **children** of [`SelectionRailTemplate`](src/features/content/locations/components/workspace/rightRail/tabs/selection/templates/SelectionRailTemplate.tsx) (alongside existing `EdgeLabelField`).
    - Do **not** add open/lock to generic `presentationRowsFromPresentation` (editable fields only).

11. **Edge-run semantics (explicit):** The edge-run inspector groups contiguous segments for UX; **persistence is still per `edgeId`**. **Door state edits from the edge-run rail apply only to the anchor segment** (`anchorEdgeId`)—the same pattern as the label field today. **Do not** broadcast door state to every segment in the run. Document this in the plan-facing inspector comment or a one-line caption next to the fields if helpful.

12. **Widen patch types**: `onPatchEdgeEntry` in Selection tab, edge inspector props, and `handlePatchEdgeEntry` to `Partial<Pick<LocationMapEdgeAuthoringEntry, 'label' | 'doorState'>>` (and route wiring from [`LocationEditRoute`](src/features/content/locations/routes/LocationEditRoute.tsx) as needed).

13. **`resolveAuthoredEdgeInstance`**: add fields such as `effectiveDoorState: Required<AuthoredDoorState>` when `placedKind === 'door'` (use `sanitizeAuthoredDoorState(entry.doorState)`); omit or use neutral defaults for non-doors.

## Phase D — Tests

14. **Unit tests**: helpers (`resolve`/`sanitize` invariants), **predicate** agreement with resolver/hydration, `normalizeEdgeAuthoringEntryForPersistence` (non-door strips `doorState`; door persists sanitized state), **`buildEdgeAuthoringEntryForStroke`** clears `doorState` when kind becomes non-door and preserves when still door.

15. **`buildEncounterSpaceFromLocationMap`**: assert door edge **default** blocks movement/sight; **`doorState: { openState: 'open' }`** does not block; **lockState** variations do not change blocking unless they imply closed/open via sanitize.

16. **UI / selection** (lightweight): extend or add tests under [`rightRail/tabs/selection/__tests__/`](src/features/content/locations/components/workspace/rightRail/tabs/selection/__tests__/) to ensure door fields only when door; walls unchanged; optional assertion that **`DoorStateFields`** emits coerced state for invalid combos.

17. **Round-trip** ([`locationMapAuthoring.roundTrip.test.ts`](src/features/content/locations/domain/authoring/map/__tests__/locationMapAuthoring.roundTrip.test.ts)): optional row with `doorState` on an edge entry.

## Notes

- **`LocationMapEdgeAuthoringState`**: stub union remains; **door open/lock** live only in **`doorState`**. Do not read **`state`** for this behavior.
- **Validation**: [`validateEdgeEntriesStructure`](shared/domain/locations/map/locationMapFeatures.validation.ts) does not validate unknown keys; optional follow-up: shallow validation of `doorState` when `kind === 'door'`—only if you want strict API hygiene in this pass.
