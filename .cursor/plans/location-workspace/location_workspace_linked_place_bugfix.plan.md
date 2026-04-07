---
name: Linked place flow — rail-first (remove modal)
overview: Replace cell-click → linked-location modal with immediate marker placement and OptionPickerField on the object inspector (Selection rail). Aligns map rendering and selection with other placed objects; drops pending-placement modal and legacy dual-path (linked icon vs object). No backward-compat migration.
isProject: false
---

# Bugfix plan: Linked city / site / building — placed-object branch + rail link picker

**Parent:** [location_workspace_object_authoring_roadmap.plan.md](location_workspace_object_authoring_roadmap.plan.md)

**Goal:** Fix inconsistent UX (no tooltip/outline/select on modal-placed “city” markers), align with roadmap principle **toolbar chooses; rail inspects**, and remove the **cell click → modal** detour.

---

## Problem statement

Today, placing a **linked-content** family (`city`, `site` with `linkedScale`) uses `resolvePlacementCellClick` → `kind: 'link'` → `pendingPlacement` → **`LocationMapEditorLinkedLocationModal`**. On confirm, only **`linkedLocationByCellId[cellId]`** is set; **no** `objectsByCellId` entry is created. The map overlay renders the **linked-location** branch (`getLocationScaleMapIcon`) instead of the **placed-object** branch (`data-map-object-id`, `PlacedObjectCellVisualDisplay`, Tooltip, object-selection hit testing).

**Desired:** Click-to-place always appends a **real cell object** (marker + `authoredPlaceKindId`). The campaign **link target** is chosen in the **Selection** tab on **[`LocationMapObjectInspector`](../../../src/features/content/locations/components/workspace/rightRail/selection/LocationMapSelectionInspectors.tsx)** via **`OptionPickerField`** (max **1** selection), updating **`linkedLocationByCellId`**.

**Label mapping (picker):** Drive the visible label from the registry family’s **`linkedScale`** (the **target location scale** for the link), not from palette `objectTitle`:

| `linkedScale` (target) | Picker label |
|------------------------|--------------|
| `city` | Linked city |
| `building` | Linked building |
| `site` | Linked site |

---

## Scope (explicit)

| In scope | Out of scope |
|----------|----------------|
| Remove modal + `pendingPlacement` link flow | Migrating old saved maps (user said **no backwards compatibility**) |
| Persistence mapping for `city` / `site` → `marker` + `authoredPlaceKindId` | New `linkedLocationId` field **on** `LocationMapCellObjectEntry` (keep cell-level `linkedLocationByCellId` unless a later refactor requests it) |
| **`OptionPickerField` on [`LocationMapObjectInspector`](../../../src/features/content/locations/components/workspace/rightRail/selection/LocationMapSelectionInspectors.tsx)** (metadata / `PlacedObjectRailTemplate`) | `LocationCellAuthoringPanel` — link UI does **not** go on empty/fill cell inspector |
| Controlled **`OptionPickerField`** first | **`FormOptionPickerField` / RHF** unless blur/validation integration is required |
| Clean up dead code (modal, link outcome in placement resolver, tests) | Changing global link policy tables beyond what options filtering already uses |
| **Update [`docs/reference/location-workspace.md`](../../../docs/reference/location-workspace.md)** — linked placement, Selection rail picker, removal of modal / `pendingPlacement` link flow; keep in sync with canonical workspace behavior | |

---

## Architecture (target)

1. **Placement (cell click):** Only **`append-object`**. Remove **`kind: 'link'`** from `PlacementCellClickResult` and `handleAuthoringCellClick` branches that call `setPendingPlacement`.
2. **Resolver:** `resolvePlacedKindToAction` must **not** return `type: 'link'` for registry `linkedScale` families; it returns **`type: 'object'`** with payload from `buildPersistedPlacedObjectPayload` after **`mapPlacedObjectKindToPersistedMapObjectKind`** supports `city` / `site` → `marker` (and `getAuthoredPlaceKindIdForPersistedPayload` returns `city` / `site`).
3. **Draft:** `linkedLocationByCellId` remains the persisted **cell → campaign location** link; it is **edited in the rail**, not via modal. Optional: clearing link when object removed (same transaction as `onRemovePlacedObjectFromMap`).
4. **UI — `OptionPickerField` on the object inspector:** Implement on [`LocationMapObjectInspector`](../../../src/features/content/locations/components/workspace/rightRail/selection/LocationMapSelectionInspectors.tsx) — it already uses [`PlacedObjectRailTemplate`](../../../src/features/content/locations/components/workspace/rightRail/selection/PlacedObjectRailTemplate.tsx) with `metadata`, `linkedDisplayName`, etc. Add the picker in **`metadata`** (or `actionsSlot`) for families that have **`linkedScale`** in the registry (`resolvePlacedObjectKindForCellObject` + registry lookup). **Do not** add link pickers to [`LocationCellAuthoringPanel`](../../../src/features/content/locations/components/workspace/rightRail/panels/LocationCellAuthoringPanel.tsx) (empty / fill-only cell).

5. **Options:** Reuse filtering logic from [`buildLocationEditLinkModalSelectOptions`](../../../src/features/content/locations/routes/locationEdit/locationEditLinkModalOptions.ts) (or extract a shared helper `getLinkedLocationPickerOptions({ host, locations, campaignId, linkedScale, excludeCellId })`) so policy and campaign scoping stay identical to today’s modal.

6. **`OptionPickerField`:** `maxItems={1}`, `value`/`onChange` as `string[]` of length 0–1; map to/from `linkedLocationByCellId[cellId]` (single id or clear).

---

## Implementation checklist

### Domain / placement

- [ ] Extend [`locationPlacedObject.persistence.ts`](../../../src/features/content/locations/domain/model/placedObjects/locationPlacedObject.persistence.ts): `city` / `site` → `marker` for relevant `hostScale`s; `getAuthoredPlaceKindIdForPersistedPayload` for `city` / `site`.
- [ ] Update [`resolvePlacedKindToAction.ts`](../../../src/features/content/locations/domain/authoring/editor/placement/resolvePlacedKindToAction.ts): remove **`linkedScale` → `type: 'link'`** branch; linked families resolve via **`buildPersistedPlacedObjectPayload`** only.
- [ ] Update [`placementRegistryResolver.ts`](../../../src/features/content/locations/domain/authoring/editor/placement/placementRegistryResolver.ts): remove **`kind: 'link'`** from `PlacementCellClickResult` and implementation.
- [ ] Update [`useLocationEditWorkspaceModel.ts`](../../../src/features/content/locations/routes/locationEdit/useLocationEditWorkspaceModel.ts): delete **`outcome.kind === 'link'`** handling.

### Editor state / route

- [ ] Remove or null-out **`pendingPlacement`** / **`setPendingPlacement`** for linked-location (see [`useLocationMapEditorState.ts`](../../../src/features/content/locations/domain/authoring/editor/state/useLocationMapEditorState.ts)) if nothing else uses it.
- [ ] Remove **`linkedLocationModal`** prop wiring from [`LocationEditRoute.tsx`](../../../src/features/content/locations/routes/LocationEditRoute.tsx) and [`LocationEditHomebrewWorkspace.tsx`](../../../src/features/content/locations/components/workspace/LocationEditHomebrewWorkspace.tsx); delete modal usage.
- [ ] Remove [`LocationMapEditorLinkedLocationModal.tsx`](../../../src/features/content/locations/components/workspace/rightRail/linkedLocation/LocationMapEditorLinkedLocationModal.tsx) and barrel exports; delete or trim [`locationEditLinkModalOptions.ts`](../../../src/features/content/locations/routes/locationEdit/locationEditLinkModalOptions.ts) after options helper is moved/shared.

### Map overlay

- [ ] [`LocationMapCellAuthoringOverlay.tsx`](../../../src/features/content/locations/components/mapGrid/LocationMapCellAuthoringOverlay.tsx): For linked-content markers, rely on **`objs`** rendering only; remove redundant **linked-only** icon row when the cell has the corresponding placed object (no compat: drop orphan linked-without-object if acceptable).

### Selection rail

- [ ] Pass **`onUpdateLinkedLocation`** into [`LocationEditorSelectionPanel`](../../../src/features/content/locations/components/workspace/rightRail/selection/LocationEditorSelectionPanel.tsx) → **`LocationMapObjectInspector`** (new props: options builder inputs or precomputed options + callback).
- [ ] Implement **`OptionPickerField`** for registry families with `linkedScale`; labels per **Label mapping** table (`linkedScale` → “Linked city” / “Linked building” / “Linked site”).
- [ ] On remove object: clear **`linkedLocationByCellId[cellId]`** when removing the object that “owns” the link (if one marker per cell for that family).

### Tests

- [ ] Update [`placementRegistryResolver.test.ts`](../../../src/features/content/locations/domain/authoring/editor/__tests__/placement/placementRegistryResolver.test.ts), [`resolveLocationPlacedKindToAction.test.ts`](../../../src/features/content/locations/domain/authoring/editor/__tests__/placement/resolveLocationPlacedKindToAction.test.ts), [`locationMapPlacement.policy.test.ts`](../../../shared/domain/locations/__tests__/map/locationMapPlacement.policy.test.ts) if needed.
- [ ] Add/adjust Selection rail / object inspector tests for picker visibility and `onUpdateLinkedLocation` calls.

### Docs (in scope)

- [ ] Update [`docs/reference/location-workspace.md`](../../../docs/reference/location-workspace.md): remove or rewrite sections that describe the **link modal** / **cell click → pending placement** flow; document **marker placement + object inspector `OptionPickerField`**, label mapping, and any touchpoints (`LocationEditRoute`, workspace shell) still accurate for contributors.

---

## Known gap (deferred)

**Multiple objects per cell vs one `linkedLocationByCellId`:** Persisted links are keyed by **`cellId`**, not by **`objectId`**. A cell can hold **multiple** `LocationMapCellObjectEntry` rows (e.g. several markers). This bugfix continues to treat **`linkedLocationByCellId[cellId]`** as the single link for that cell — sufficient when at most one linked-content marker per cell is expected. **Supporting distinct campaign links per object on the same cell** requires a model change (e.g. `linkedLocationId` on the object, or link id keyed by object). **Out of scope here;** track for a follow-up when product needs it.

---

## Risks and architectural concerns

1. **Erase / Delete:** Ensure erase of the cell’s linked marker clears **`linkedLocationByCellId`** for that cell to avoid stale links.

2. **Campaign-only options:** Modal today returned **[]** for non-campaign; rail picker must match (empty state + helper text).

3. **Layering:** Keep **`getAllowedLinkedLocationOptions`** (policy) as the filter for option lists.

4. **`pendingPlacement` reuse:** Grep for other `pendingPlacement` uses before deleting state.

5. **Palette `building` family vs “Linked building”:** The **building** placed-object family (residential/civic markers) is unrelated to the label **“Linked building”**, which refers only to **`linkedScale === 'building'`** (campaign location target scale) on families that define that link target.

---

## Acceptance criteria

1. Placing city/site/building (linked families) **never** opens a modal; cell gets a **marker** object immediately.
2. **Selection** on that object (object inspector) shows **`OptionPickerField`** with label from **Label mapping** (`linkedScale` → “Linked city” / “Linked building” / “Linked site”) and **max 1** linked location; changing selection updates **`linkedLocationByCellId`**.
3. Map overlay uses **object** path (tooltip, outline, `data-map-object-id`, select priority) consistent with other markers.
4. Modal component and link placement branch **removed**; tests updated; **[`docs/reference/location-workspace.md`](../../../docs/reference/location-workspace.md)** updated to match.
