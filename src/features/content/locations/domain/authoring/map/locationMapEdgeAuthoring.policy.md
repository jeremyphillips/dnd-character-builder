# Edge authoring rows — consumer policy & invariants

This document locks **how** `LocationMapEdgeAuthoringEntry` rows are read and written so door/window authored identity does not drift across the app.

## Wall vs door / window (intentional split)

- **`kind: 'wall'`** — **coarse-only** in the current model: `{ edgeId, kind }` (+ optional `label` / `state` later). Walls are **not** pulled into registry authored-object identity (`authoredPlaceKindId` / `variantId`). Stray authored fields on wall rows are **stripped on normalize**.
- **`kind: 'door'` / `'window'`** — May persist a **richer authored-instance** bundle: `authoredPlaceKindId`, `variantId`, `label`, optional **`doorState`** (door instances only: open/lock authoring), and optional stub **`state`** (reserved for other/future edge concerns — **not** used for door open/lock; **`doorState`** is authoritative for that behavior).

## Row-shape invariant (door/window authored bundle)

On **save** (`normalizeEdgeAuthoringEntryForPersistence`):

- **`authoredPlaceKindId` and `variantId` are all-or-nothing** for registry-backed opening identity:
  - If valid `authoredPlaceKindId` (door/window) is present but **`variantId` is missing or invalid**, **both** are removed → **coarse** opening row (`kind` only, plus optional `label` / `state`).
  - If **`kind`** is door/window and **`variantId` is valid** but **`authoredPlaceKindId` was absent** (or invalid string was stripped), **`authoredPlaceKindId` is backfilled from `kind`** so the row becomes a **coherent** `{ kind, authoredPlaceKindId, variantId }` bundle (salvage, not a half-authored state).

**New placements** from the place tool already write the full bundle via `applyEdgeStrokeToDraft` + enriched payload.

## Consumer classes

### Coarse consumers (default for geometry, combat, SVG underlay)

Use **only**:

- `edgeId`
- `kind`

**Examples:** `edgeEntriesToSegmentGeometrySquare`, `buildEncounterAuthoringPresentationFromLocationMap` (presentation blob strips to `{ edgeId, kind }`), map stroke styling by `kind`, erase/prune, select-mode hit testing that only needs segment identity.

**Exception — encounter door edges:** `buildEncounterSpaceFromLocationMap` maps interior segments to `EncounterEdge` and, for rows that resolve to a **door** instance (`isLocationMapEdgeEntryDoorInstance`), also reads **`doorState`** to set **movement and line-of-sight blocking** on that edge (open vs closed). It does **not** use `doorState` for geometry or SVG. **`lockState`** is ignored for encounter mechanics in the current pass (persisted for authoring only).

**Do not** infer authored registry identity from defaults here; coarse lane is authoritative for these paths except the door blocking exception above.

### Authored-identity consumers

Any surface that must reflect **persisted** `authoredPlaceKindId`, **`variantId`**, or **label** semantics must use:

- **`resolveAuthoredEdgeInstance`** from `locationMapEdgeAuthoring.resolve.ts` (or a thin wrapper that delegates to it).

**Today:** the selection rail (`LocationMapEdgeInspector` / `LocationMapEdgeRunInspector`) is the primary authored-identity consumer.

**There is no second competing authored-edge resolver** — do not add parallel “default variant + kind” inference trees for persisted rows.

### Stub `state` vs `doorState`

- **`doorState`** — Authoritative persisted **door** open/lock authoring; consumed by normalization, selection rail, and encounter door-edge blocking (see above).
- **`state`** (`LocationMapEdgeAuthoringState`) — Reserved for **non-door** or additional edge-instance options when shipped; **not** read for door open/lock (use **`doorState`**).

## Run selection vs persistence

- **Persistence** is **per `edgeId` row** (atomic segment).
- **Edge-run** selection groups contiguous segments with the **same coarse `kind`** for UX; it is **not** a persisted run record. Adjacent segments with the same `kind` but **different** `variantId` may still group — **intentional current limitation**; richer run semantics are **deferred**.

## Audit snapshot (concise)

| Area | Coarse vs authored |
|------|---------------------|
| Selection rail | **Authored-identity** via `resolveAuthoredEdgeInstance` |
| Editor map SVG edge strokes | **Coarse** (`kind` for stroke style) |
| Combat encounter build (door movement/LOS on `EncounterEdge`) | **Door rows:** `kind` + **`doorState`**; others coarse |
| Authoring presentation overlay | **Coarse** |
| Geometry helpers | **Coarse** (`edgeId` + `kind` in segment geometry) |
