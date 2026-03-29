# Locations domain (reference)

This document describes **where code lives** and **how the three layers** (location, map, transition) relate, plus **validation** boundaries. Use it to onboard quickly when extending authoring, APIs, or shared rules.

## Mental model

| Layer | Role |
|-------|------|
| **Location** | Campaign place: name, scale, category, hierarchy (`parentId` / `ancestorIds`), optional connections, optional image. One location can have **multiple maps**. |
| **Map** | Tactical grid for a location: dimensions, cell unit, kind, cells, optional layout (e.g. excluded cells), sparse **cell authoring** (linked child locations + simple objects on cells). |
| **Transition** | Edge from a **source map cell** to a **target location** (and optionally target map / cells): doors, stairs, portals, zoom, etc. |

Persistence models live under `server/shared/models/`: `CampaignLocation`, `CampaignLocationMap`, `CampaignLocationTransition`.

---

## Shared domain (`shared/domain/locations/`)

**Single public entry:** import from `shared/domain/locations` (barrel: `index.ts`). Do not assume old flat filenames still exist at the folder root except the two listed below.

### Root files (stable paths)

| File | Contents |
|------|----------|
| `location.constants.ts` | `LOCATION_SCALE_ORDER`, `LOCATION_CATEGORY_IDS`, `LOCATION_CONNECTION_KIND_IDS`. |
| `location.types.ts` | `LocationScaleId`, `LocationCategoryId`, `LocationConnection`, `LocationLabel`, etc. |

**Important:** `LOCATION_SCALE_ORDER` is **coarsest → finest** for generic rank (`locationScale.rules.ts`). **Allowed parent/child scale pairs** are **not** inferred from order alone; they live in `scale/locationScale.policy.ts` (`ALLOWED_PARENT_SCALES_BY_SCALE`).

### Subfolders (re-exported by barrel)

| Folder | Responsibility |
|--------|----------------|
| `scale/` | Scale **business policy** (who may parent whom), **field policy** (categories, cell units, which form fields apply per scale), **rules** (valid scale id, rank, world check), **parent validation** (`validateParentChildScales` for hierarchy). |
| `map/` | Map **constants** (kinds, cell units by kind, object kinds), **types** (`LocationMapBase`, grid, cells, cell authoring), **helpers** (`mapKindForLocationScale`, `getDefaultMapKindForScale` — derives map kind during save/bootstrap, `isCellUnitAllowedForScale`), **placement policy** (what can be placed / linked on cells by scale), **validation** (grid, cells, map input, cell authoring structure). |
| `transitions/` | Transition **kinds** (`LOCATION_TRANSITION_KIND_IDS`) and **shared types** (`LocationTransitionBase`, `from` / `to` shapes). |

### Tests

Under `shared/domain/locations/__tests__/`, mirroring source: e.g. `__tests__/scale/`, `__tests__/map/`.

---

## Layer details

### Location layer

- **Constants & types:** `location.constants.ts`, `location.types.ts`.
- **Hierarchy helpers (server-facing but pure rank/ancestor construction):** `server/features/content/locations/domain/locations.hierarchy.ts` — imports scale vocabulary and re-exports `validateParentChildScales` from shared (`scale/locationParent.validation.ts` via barrel).
- **Field / UX policy:** `scale/locationScaleField.policy.ts` — per-scale allowed categories, cell units, fixed/hidden fields; used by client form registry and server normalization (e.g. category/cell unit). Parent eligibility remains in `locationScale.policy.ts`.
- **Server:** `locations.service.ts` enforces create/update rules (scale, parent, categories, etc.) using shared validators and DB lookups.

### Map layer

- **Authoring vocabulary:** `map/locationMap.constants.ts` (`LOCATION_MAP_KIND_IDS`, `LOCATION_CELL_UNIT_IDS`, object kinds).
- **Shapes:** `map/locationMap.types.ts` (`LocationMapGrid`, `LocationMapCell`, `LocationMapCellAuthoringEntry`, …).
- **Pure validation:** `map/locationMap.validation.ts`, `map/locationMapCellAuthoring.validation.ts` — no database; safe for client and server.
- **Placement rules (gameplay policy):** `map/locationMapPlacement.policy.ts` — e.g. which object kinds / link rules apply on a host scale (complements field policy).
- **Client:** default map bootstrap, grid drafting, cell authoring mappers under `src/features/content/locations/domain/maps/`; display icons under `domain/map/`; repo helpers `locationMapRepo.ts`.

### Transition layer

- **Shared:** `transitions/locationTransition.constants.ts`, `transitions/locationTransition.types.ts`.
- **Server:** `locationTransitions.service.ts` plus **`locationTransitionValidation.ts`** — validates kind, resolves source/target maps and locations, ensures `from.cellId` exists on source map cells (`cellIdExistsOnMap` from shared map validation).
- **Facade:** `server/.../locationValidation.ts` re-exports transition validators alongside map and hierarchy helpers so feature code has one import surface.

---

## Validation (brief)

| Kind | Where | Notes |
|------|--------|--------|
| **Pure / shared** | `shared/domain/locations` (map input, cells, cell entries structure, parent scale pairing, transition kind enum) | No I/O; same rules client + server. |
| **Server facade** | `server/features/content/locations/services/locationValidation.ts` | Re-exports shared validators + renames (e.g. `validateLocationScaleNesting`) + transition exports from `locationTransitionValidation.ts`. |
| **Persistence-aware** | `locationTransitionValidation.ts`, `locations.service.ts`, `locationMaps.service.ts` | Loads `CampaignLocation` / `CampaignLocationMap`, checks existence, campaign scope, references. |

**Error shapes:** map errors use `LocationMapValidationError` (shared); transition errors use `TransitionValidationError` in `locationTransitionValidation.ts` (`path`, `code`, `message`).

**Client-side change validation:** `src/features/content/locations/domain/validation/validateLocationChange.ts` coordinates UX constraints when editing.

---

## Client feature layout (`src/features/content/locations/`)

| Area | Purpose |
|------|---------|
| `routes/` | List, create, edit, detail routes. Create and edit use the full-width workspace shell (see below); detail stays content-width for now. |
| `domain/forms/` | Form types, registry (`locationForm.registry.ts`), mappers, sanitize, dependent-field policy / UI rules. |
| `domain/repo/` | `locationRepo`, `locationMapRepo` — API/data access for lists and maps. |
| `domain/maps/` | `bootstrapDefaultLocationMap` (client-side default map creation/update), grid layout draft helpers, cell entry mappers. Uses `getDefaultMapKindForScale` from shared domain to derive map kind. |
| `components/` | `LocationGridAuthoringSection` (interactive grid preview with computed cell sizing for canvas fit), cell modal, cards. |
| `components/workspace/` | Map-first editor workspace shell — see section below. |
| `hooks/` | Campaign data, parent picker options, default world scale, dependent field effects. |

### Workspace shell (`components/workspace/`)

Location create and edit routes render inside a full-width workspace (via `AuthMainFocus` layout mode, triggered by `isAuthMainFocusPath` in `src/app/layouts/auth/auth-main-path.ts`). The workspace is composed of feature-owned components:

| Component | Role |
|-----------|------|
| `LocationEditorWorkspace` | Outer flex column: header slot + body row (canvas + right rail). Body row capped at `calc(100vh - headerHeight)`. |
| `LocationEditorHeader` | Sticky header: title, ancestry breadcrumbs, global save button, right-rail toggle, optional actions (e.g. delete). |
| `LocationEditorCanvas` | Flex-filling canvas region with zoom/pan transform wrapper. Hosts `LocationGridAuthoringSection` as child content and renders `ZoomControl` (fixed positioned). |
| `LocationEditorRightRail` | Collapsible right rail (default open) containing all form fields. Uses CSS width transition with `overflow: hidden` outer and scrollable inner. |
| `LocationAncestryBreadcrumbs` | Builds a breadcrumb trail from `parentId` chain; used in the header. |
| `locationEditor.constants.ts` | Shared pixel constants: `LOCATION_EDITOR_HEADER_HEIGHT_PX`, `LOCATION_EDITOR_RIGHT_RAIL_WIDTH_PX`. |

### Shared canvas hooks (`src/ui/hooks/`)

Zoom and pan behavior is shared between the location editor and encounter active route via reusable hooks:

| Export | Role |
|--------|------|
| `useCanvasZoom` | Zoom state, `zoomIn`/`zoomOut`/`zoomReset`, `zoomControlProps` spread for `ZoomControl`, `wheelContainerRef` (non-passive listener for Ctrl/Cmd + scroll / trackpad pinch). `bindResetPan` coordinates pan reset with zoom reset. |
| `useCanvasPan` | Pan state, pointer drag handlers (`pointerHandlers` spread), `isDragging`, `hasDragMoved()` (distinguishes click from drag), `resetPan`. |
| `CanvasPoint` | Shared type `{ x: number; y: number }`. |

Both hooks are used at the route level; derived values are passed down to canvas/grid components as props.

Imports of shared vocabulary should prefer **`@/shared/domain/locations`** for scale constants, map constants, and policies.

---

## Server feature layout (`server/features/content/locations/`)

| Area | Purpose |
|------|---------|
| `services/` | `locations.service`, `locationMaps.service`, `locationTransitions.service`, `locationValidation`, `locationTransitionValidation`. |
| `domain/` | `locations.hierarchy`, tests. |
| `controllers/`, `routes/` | HTTP API wiring. |

---

## Pointers for the next agent

1. **Extend scale rules:** edit `scale/locationScale.policy.ts` and `scale/locationParent.validation.ts`; keep `locationScaleField.policy.ts` in sync for categories/cell units/UI.
2. **Extend map rules:** prefer `map/locationMap.validation.ts` / `locationMapCellAuthoring.validation.ts` for structural checks; `locationMapPlacement.policy.ts` for “what may appear on a cell” by scale.
3. **New transition kinds:** add to `LOCATION_TRANSITION_KIND_IDS` and any server checks; shared types in `transitions/`.
4. **Imports:** use the **barrel** `shared/domain/locations` unless you have a reason to deep-import a subfolder. Canvas hooks: `@/ui/hooks`.
5. **Tests:** add shared tests under `__tests__/scale/` or `__tests__/map/`; server tests next to services/domain in `server/features/content/locations/`.
6. **Workspace layout changes:** modify components under `components/workspace/`; constants in `locationEditor.constants.ts`. Do not add workspace layout logic to the generic content template system.
7. **Zoom/pan enhancements:** extend `useCanvasZoom` / `useCanvasPan` in `src/ui/hooks/`; both location and encounter features consume them. `ZoomControl` supports `positioning` prop (`'fixed'` default, `'absolute'` for container-relative).
8. **Focus-mode routes:** add new full-width routes by extending the regex in `src/app/layouts/auth/auth-main-path.ts`.
