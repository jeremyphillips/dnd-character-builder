---
name: Location workspace dirty state
overview: Replace the split `isDirty || isGridDraftDirty` model with a single **canonical persistable snapshot** (matching what `handleCampaignSubmit` actually persists), compared to a baseline updated on hydration and successful save. This is DRY, scales to new rail tools and parallel state, and avoids per-field wiring.
todos:
  - id: snapshot-helper
    content: Add workspacePersistableSnapshot (form + normalized map + building stairs) aligned with save
    status: pending
  - id: baseline-lifecycle
    content: Set baseline on hydration + post-save; replace isDirty||isGridDraftDirty with isWorkspaceDirty in route
    status: pending
  - id: subscribe-form
    content: Ensure watch()/useWatch covers all saved form fields so header re-renders
    status: pending
  - id: tests
    content: Unit tests for snapshot equality across representative edits
    status: pending
  - id: docs-location-workspace
    content: Update docs/reference/location-workspace.md with dirty/save architecture and pointers
    status: pending
isProject: true
---

# Location map workspace: scalable dirty-state plan

## Current behavior (as implemented)

- Campaign edit header uses `[LocationEditRoute.tsx](src/features/content/locations/routes/LocationEditRoute.tsx)`: `dirty={isDirty || isGridDraftDirty}`.
- `**isDirty**`: from React Hook Form in `[useLocationEditWorkspaceModel.ts](src/features/content/locations/routes/locationEdit/useLocationEditWorkspaceModel.ts)` (`formState.isDirty`).
- `**isGridDraftDirty**`: `!gridDraftPersistableEquals(gridDraft, gridDraftBaseline)` in the same hook; `[gridDraftPersistableEquals](src/features/content/locations/components/locationGridDraft.utils.ts)` compares **normalized, persisted map payload** (and intentionally ignores UI-only fields like `mapSelection` / `selectedCellId`).
- **Save path** (`[useLocationEditSaveActions.ts](src/features/content/locations/routes/locationEdit/useLocationEditSaveActions.ts)`): `toLocationInput(values)` + `bootstrapDefaultLocationMap(..., { excludedCellIds, ...normalizedAuthoringPayloadFromGridDraft(draft) })`, and for **building** scale, `**buildingStairConnectionsRef.current`** merged into `buildingProfile.stairConnections`.

Rail tabs (**Location / Map / Selection**) are not separate stores: they all feed the same `FormProvider` form, `gridDraft`, and (for buildings) `buildingStairConnections`. There is no need for tab-specific dirty flags if the **aggregate snapshot** is correct.

## Root causes this design fixes

1. **Split sources of truth** — Anything that is **saved** but **not** reflected in RHF `isDirty` or in `gridDraftPersistableEquals` will keep Save disabled. The save path already uses `**buildingStairConnectionsRef`** for building saves; that state lives **outside** the current `dirty` expression and is a **concrete gap** for “rail changed but Save stays off” whenever connections and normalized grid data do not both move (or when only the ref-relevant slice changes). A **single snapshot** that mirrors submit inputs removes this class of bug for future parallel state too.
2. **RHF `isDirty` fragility** — Conditional fields, programmatic `setValue` without `shouldDirty`, or subscription quirks can miss edits. Comparing `**getValues()`-derived persistable input** (same shape as save) is more reliable than trusting `isDirty` alone.
3. **Map draft compare is already normalized** — `[gridDraftPersistableEquals](src/features/content/locations/components/locationGridDraft.utils.ts)` + `[normalizedAuthoringPayloadFromGridDraft](src/features/content/locations/components/locationGridDraft.utils.ts)` are the right building blocks; extend them into a **workspace-level** compare, not new per-field listeners.

## Recommended approach: canonical “persistable snapshot” + baseline

**Idea:** Define one function (or small module) that builds the **same logical payload** the server would receive from the editor: location fields from the form, map authoring from `gridDraft`, and building stair connections when `loc.scale === 'building'`. Compare **stable-serialized** current vs baseline.


| When                                        | Baseline update                                                                                                                                                                  |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| After map + form **hydration** succeeds     | Match `[hydrateDefaultLocationMap](src/features/content/locations/routes/hydrateDefaultLocationMap.ts)` / existing `setGridDraftBaseline` timing                                 |
| After **successful** `handleCampaignSubmit` | Same moment as today: `reset(...)` + `setGridDraftBaseline(structuredClone(gridDraftRef.current))` — also set `**buildingConnectionsBaseline`** (or fold into one baseline blob) |


**Dirty:** `!workspaceSnapshotEquals(current, baseline)`.

**Re-renders:** The hook must subscribe to **all** form values that affect save (e.g. `watch()` without args, or `useWatch({ control })` over the full form) plus `gridDraft` and `buildingStairConnections` so the header updates when any slice changes.

### Wiring (obvious / scalable)

- **Single export** from the workspace model, e.g. `isWorkspaceDirty`, used by `[LocationEditRoute.tsx](src/features/content/locations/routes/LocationEditRoute.tsx)` instead of `isDirty || isGridDraftDirty`.
- **Implementation detail:** Prefer **composing** existing helpers:
  - Map slice: reuse `normalizedAuthoringPayloadFromGridDraft` + `excludedCellIds` (same as save); optionally keep using `gridDraftPersistableEquals` **internally** for the map half to avoid duplicating sort/normalization rules.
  - Location slice: align with `toLocationInput(getValues())` or a shared `pick` list so new saved fields automatically join the snapshot when someone extends `toLocationInput`.
  - Building slice: include **normalized** `buildingStairConnections` (stable sort + stable stringify) when building save applies.

### Optional follow-up (not required for dirty, but reduces drift)

- Extract `**buildCampaignLocationPersistPayload(...)`** (or similar) used by both `**handleCampaignSubmit**` and `**workspaceSnapshotEquals**` so dirty and save **cannot diverge**.

## Technical limitations

- **Nested forms with local-only state** — e.g. `[LocationMapRegionMetadataForm](src/features/content/locations/components/workspace/LocationMapRegionMetadataForm.tsx)` commits to `gridDraft` only on its **Submit** button. Until that fires, the snapshot (and server) will not include those edits; header Save cannot reflect them. Fixing that is a **separate UX decision** (lift `onChange` into draft, or block header Save with a warning), not solved by dirty plumbing alone.
- **Snapshot vs API drift** — If someone changes save logic but not the snapshot helper, dirty can lie. Mitigation: shared helper with save (see above).
- **Performance** — Full snapshot compare each render is usually fine; if needed, memoize a **string snapshot** + compare strings, or debounce (only if profiling shows cost).

## Risks

- **False positives** after grid **prune** / dimension changes: draft and baseline can diverge in edge cases where layout effects run in different orders. Mitigate by setting baseline during the same **hydration** / **save** boundaries you already use, and add a focused test when changing grid dimensions.
- **False negatives** if a new persisted field is added **outside** `toLocationInput` / map bootstrap and not added to the snapshot.
- **System patch route** (`[LocationEditRoute.tsx](src/features/content/locations/routes/LocationEditRoute.tsx)` `isSystem` branch) uses `driver.isDirty() || isGridDraftDirty` — apply the same **snapshot** idea for campaign path first; patch driver may still need its own dirty source unless the snapshot includes patch state.

## Files likely touched

- `[useLocationEditWorkspaceModel.ts](src/features/content/locations/routes/locationEdit/useLocationEditWorkspaceModel.ts)` — compute `isWorkspaceDirty`, baseline refs/state, subscribe via `watch`.
- `[useLocationEditSaveActions.ts](src/features/content/locations/routes/locationEdit/useLocationEditSaveActions.ts)` — align baseline updates after save with snapshot baseline (or pass `onSaveSuccess` callback that sets one baseline).
- `[LocationEditRoute.tsx](src/features/content/locations/routes/LocationEditRoute.tsx)` — pass `dirty={isWorkspaceDirty}` (name TBD).
- New small module under `routes/locationEdit/` or `components/` e.g. `workspacePersistableSnapshot.ts` + unit tests comparing before/after known edits (form field, cell fill, object label, stair connection array).

## Tests to add

- **Unit:** snapshot equality after hydration mock; after changing one of: form field, `cellFillByCellId`, object metadata, `pathEntries`, `buildingStairConnections` (building mode).
- **Regression:** Save enables when only building stair connections change without a corresponding grid diff (if that scenario is possible in product rules).

## Documentation scope

Update `[docs/reference/location-workspace.md](docs/reference/location-workspace.md)` as part of the same change set (or immediately after merge) so the reference stays the single place for workspace behavior.

**Suggested content to add or extend (Client feature touchpoints / new subsection):**

- **Dirty state and Save:** Explain that the header Save button reflects **persistable workspace** changes (location form values + map authoring draft + building stair connections when applicable), not per-tab or per–react-hook-form `isDirty` alone. Point to the snapshot module / `useLocationEditWorkspaceModel` (or whatever names ship).
- **Rail tabs vs persistence:** Clarify that Location / Map / Selection share the same underlying state; “dirty” is aggregate. Map-only UI (mode, swatch selection, `mapSelection`) stays excluded from persistable compare where documented in code.
- **Baseline lifecycle:** Short note: baseline resets after successful save and after map+form hydration for the active location/floor.
- **Pointers for the next agent:** Add a bullet to extend the snapshot when adding new **saved** state that is not on `LocationFormValues` or `gridDraft` (parallel `useState`, refs merged at save).

This satisfies “obvious wiring” for future contributors without duplicating full API docs.

## Gaps and risks (iteration backlog)

Use this list to prioritize follow-up work after the initial snapshot ships.

### Gaps (product / architecture)

- **Nested rail forms:** Region metadata (`LocationMapRegionMetadataForm`) and any similar **submit-to-commit** inspectors can leave edits in local form state while the header snapshot stays “clean.” Options to iterate: auto-sync on change, dirty flag on nested form, or explicit “unsaved changes in panel” copy.
- **System patch workspace:** Campaign snapshot work may not cover `driver.isDirty()` + grid for system locations; verify parity or document a second rule.
- **Save vs snapshot drift:** Until `buildCampaignLocationPersistPayload` is shared, two code paths can diverge; treat unifying as a follow-up when touching save again.
- **New parallel state:** Any future `useState` / ref merged in `handleCampaignSubmit` must be added to the snapshot and baseline; consider a lint or checklist in the doc.
- **Whitespace / normalization:** Persistable normalization may treat some user-visible string edits as equal (e.g. trim); document if that is intentional.

### Risks (correctness / UX)

- **False positives:** User sees Save enabled with “no obvious change” after grid prune, preset changes, or hydration race; collect cases and tune baseline timing.
- **False negatives:** Save stays disabled after a real edit; regression tests and manual passes on all three rail tabs after each release touching workspace.
- **Performance:** Large maps or many stair connections; if snapshot stringification becomes hot, profile and memoize.
- **Building + floor switching:** Ensure baseline updates when `activeFloorId` changes so dirty does not leak between floors.

### Process

- After implementation, **link from** the doc’s “Pointers for the next agent” to the snapshot module and to this gaps list for ongoing iteration.

