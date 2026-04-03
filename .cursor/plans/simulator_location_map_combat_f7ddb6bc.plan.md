---
name: Simulator location map combat
overview: Host integration only—simulator starts combat via the same map-first space contract as server/game session; remove grid-preset path entirely; shared pure helpers for parity; update docs/reference for simulator space resolution. Not an encounter/combat architecture pass. Prerequisites done—see § Completed prerequisites.
todos:
  - id: docs-reference
    content: Update docs/reference (combat/game-session/simulator) for map-first simulator start and removed grid preset
    status: completed
  - id: shared-helpers
    content: Add pickEncounterGridMap, resolveSimulatorMapHostLocationId (first floor), buildSimulatorFallbackEncounterSpace; refactor server resolver to use shared picks
    status: completed
  - id: lift-state
    content: Minimal lift—locations + buildingLocationIds + one-shot default-building into EncounterRuntimeContext for Start handler
    status: completed
  - id: async-start
    content: Async resolve + loading/double-submit guard/error without partial state; no placeRandomGridObject on fallback unless documented exception
    status: completed
  - id: remove-grid-preset
    content: Remove grid preset end-to-end—EncounterGridSetup, EncounterSetupView gridSetup, context, policy types, start handler
    status: pending
  - id: tests
    content: Unit tests for shared helpers + resolver; tsc + relevant suites
    status: completed
isProject: false
---

# Simulator: authored location map combat + full removal of grid preset

## Scope (read first)

| In scope | Out of scope |
|----------|----------------|
| Simulator **host integration**: resolve tactical space the **same way** as [`resolveEncounterSpaceForGameSessionStart`](server/features/gameSession/services/resolveGameSessionCombatSpace.server.ts) (map-first, shared pure helpers). | Broad **encounter/combat architecture** (wrapper renames, `CombatPlayView` slot renames, export-barrel cleanup, splitting `useEncounterActivePlaySurface`). |
| **Remove legacy grid preset** path completely (UI, context, policy, start handler)—no mixed preset + map behavior. | Game session UI changes unless importing shared helpers for consistency. |
| **Minimal** lifted state in [`EncounterRuntimeContext`](src/features/encounter/routes/EncounterRuntimeContext.tsx) so the Start button can resolve space (see § Host vs runtime state). | Declaring permanent ownership of “all simulator setup state” by runtime context. |
| **Documentation:** update relevant [`docs/reference`](docs/reference) files (combat client overview, game-session combat, glossary, or simulator-adjacent notes) so simulator **map-first** start and **no grid preset** are documented. | Rewriting unrelated docs. |

Prerequisite UI-boundary work is **done** (CombatPlayView props, CombatGrid wiring, docs)—see [`architecture_encounter_combat_hosts.plan.md`](architecture_encounter_combat_hosts.plan.md).

---

## Completed prerequisites (do not redo)

- **CombatPlayView:** layout offsets via props; no encounter imports in `features/combat`.
- **Tactical grid:** `EncounterGrid.tsx` removed; `CombatGrid` + optional barrel alias `EncounterGrid`.
- **Docs:** `docs/reference` updated for grid/combat boundaries.

**Naming:** this pass removes **EncounterGridSetup** (setup **preset** UI)—not the old `EncounterGrid` wrapper.

---

## Goal

When the user starts combat in the **Encounter Simulator**, build [`EncounterSpace`](packages/mechanics) using the **map-first** contract aligned with **server + game session**: resolve map host → list maps → pick encounter-grid map → [`buildEncounterSpaceFromLocationMap`](src/features/game-session/combat/buildEncounterSpaceFromLocationMap.ts), else **fallback square grid** matching server dimensions/ids pattern. **Eliminate** the old **grid size preset** (`GRID_SIZE_PRESETS` / `EncounterGridSetup`) from simulator setup entirely.

---

## Server / game-session parity contract (mandatory semantics)

The simulator must follow the **same decision order** as [`resolveGameSessionCombatSpace.server.ts`](server/features/gameSession/services/resolveGameSessionCombatSpace.server.ts). **Do not** add simulator-only branches unless the behavior is **intentional** and **documented in code** (e.g. a one-line comment + PR note).

1. **Resolve `mapHostLocationId`** — for this pass, building → **first floor** only (see § Map host helper). If unresolvable, fall through to fallback like server when floor missing.
2. **`listMapsForLocation`** (server) / **`listLocationMaps(campaignId, mapHostLocationId)`** (client).
3. **Filter** `kind === 'encounter-grid'`; **pick** `isDefault` ?? **first** (same as server lines 139–140).
4. If **chosen:** `buildEncounterSpaceFromLocationMap({ mapHostLocationId, map: chosen })`.
5. Else: **fallback** `EncounterSpace` (see § Fallback)—**no** `placeRandomGridObject` unless product explicitly overrides (see § Fallback).

**Anti-drift:** implement steps 3–5 (and shared fallback builder) as **pure/shared helpers** consumed by **both** server resolver refactor and simulator start. Client async + HTTP vs server Mongo is expected; **logic** should not diverge.

---

## Map host resolution (first floor only, explicit helper)

Isolate the “building → floor used as map host” rule in **one small function** with an **explicit name**, e.g.:

- **`resolveSimulatorMapHostLocationId(args: { buildingLocationId: string; locations: Location[] }): string | null`**

Implementation: use [`listFloorChildren`](src/features/content/locations/domain/building/buildingWorkspaceFloors.ts) (or equivalent sort) and return **first floor’s `id`**, or `null` if none.

**Assumption:** This is a **first-pass** simulator shortcut (no floor picker). **Document in JSDoc** that explicit floor selection may replace this later without changing `pickEncounterGridMap` / fallback contract.

*Alternative name:* `getFirstFloorIdForBuildingMapHost` — same idea; pick one and use consistently.

---

## Fallback behavior (decisive default)

| Path | Behavior |
|------|----------|
| **Authored map** (`buildEncounterSpaceFromLocationMap`) | Use map as built; **do not** call `placeRandomGridObject`. |
| **Fallback** square grid (`createSquareGridSpace` / shared `buildSimulatorFallbackEncounterSpace`) | **Default: match server** — **no** `placeRandomGridObject` (server fallback does not inject a random procedural object). |

If anyone preserves **old simulator-only** random clutter on fallback, they must **explicitly** justify it (product decision) and **comment** in the start path; otherwise ship **parity**.

---

## Host vs runtime state responsibility

**Lift** into [`EncounterRuntimeContext`](src/features/encounter/routes/EncounterRuntimeContext.tsx) for this pass:

- `locations` + load via `listCampaignLocations(campaignId)`
- `buildingLocationIds` (max one id) + setter
- **Optional one-shot default** (see § Simulator-only default)

This is **pragmatic glue** so the **Start combat** handler (defined on the setup header in context) can call the resolver **without** threading many props through the route. It is **not** a statement that `EncounterRuntimeContext` **permanently** owns all future simulator setup state—keep the **surface minimal** (only what Start + building UI need). Prefer **not** adding unrelated setup fields in the same PR.

---

## Simulator-only quick-start default (first building)

- **What:** If `locations` has loaded, `buildingLocationIds` is empty, and there is at least one **building** scale location, set `buildingLocationIds` to `[firstBuildingId]` (stable order consistent with current select options).
- **Where:** Only **simulator** setup / this runtime wiring—not **game session** setup, not shared “encounter setup semantics.”
- **Guard:** **One-shot** ref (`hasAppliedInitialBuildingDefault` or similar) so a user **clear** does not immediately re-apply the default in the same session.
- **Leak prevention:** Keep logic in simulator route/context code paths that game session does not import; do **not** move this into shared game-session forms unless product asks later.

---

## Async “Start combat” UX (required)

The start path **must** include:

- **Loading / in-flight** state while `listLocationMaps` (and any other async work) runs; disable or clearly indicate busy **Start** UI.
- **Double-submit / double-click** prevention while resolution is in-flight (disable button, ignore duplicate clicks, or equivalent).
- **Error reporting** if resolution fails—**without** mutating encounter runtime into a half-started combat (no partial `setEncounterState` on failure; user can retry).

Implementation can be **simple** (local `useState` + button `disabled`); the plan requires these behaviors **by design**, not as accidents.

---

## Remove legacy grid preset path completely

This pass **ends** preset-based grid sizing for the simulator. **Remove end-to-end:**

| Layer | Action |
|-------|--------|
| UI | Delete [`EncounterGridSetup.tsx`](src/features/encounter/components/setup/options/EncounterGridSetup.tsx); remove `gridSetup` from [`EncounterSetupView`](src/features/encounter/components/setup/layout/EncounterSetupView.tsx) and route. |
| Barrel | Drop `EncounterGridSetup` export from [`encounter/components/index.ts`](src/features/encounter/components/index.ts). |
| Context | Remove `gridSizePreset` / `setGridSizePreset`, `GRID_SIZE_PRESETS` imports/usage, and any exports from [`EncounterRuntimeContext`](src/features/encounter/routes/EncounterRuntimeContext.tsx). |
| Policy | Remove `gridSizePresetDefault` from [`encounter-setup-policy.types.ts`](src/features/encounter/domain/setup/encounter-setup-policy.types.ts) and [`simulatorEncounterSetupPolicy.ts`](src/features/encounter/domain/setup/simulatorEncounterSetupPolicy.ts) if nothing else references it. |
| Start handler | Only the **map-first resolver** path; **no** remaining preset branches. |

**Acceptance:** Grep for `gridSizePreset`, `EncounterGridSetup`, `GRID_SIZE_PRESETS` in simulator setup paths should be clean (allow unrelated hits only if any remain elsewhere with justification).

---

## Shared helpers (implementation detail)

Place **pure** functions beside existing map build code where practical, e.g. [`src/features/game-session/combat/`](src/features/game-session/combat/):

| Helper | Responsibility |
|--------|----------------|
| **`pickEncounterGridMap(maps: LocationMapBase[])`** | `filter` encounter-grid; `find(isDefault) ?? [0]`; **must** match server. |
| **`buildSimulatorFallbackEncounterSpace` (or shared name)** | Wrap `createSquareGridSpace` to match server `fallbackSpace` (10×10, `cellFeet: 5`, ids/names pattern). |
| **`resolveSimulatorMapHostLocationId`** | First floor only; see § Map host. |

Refactor **server** [`resolveGameSessionCombatSpace.server.ts`](server/features/gameSession/services/resolveGameSessionCombatSpace.server.ts) to call `pickEncounterGridMap` (and shared fallback if extracted) so **one** implementation drives parity.

**Client resolver:** A thin async function (e.g. `resolveEncounterSpaceForSimulatorStart`) may orchestrate: map host → `listLocationMaps` → pure picks → build or fallback—**no** duplicate selection logic inline in the button.

---

## Tests

- Unit tests for `pickEncounterGridMap` and map-host helper (edge: empty floors, no maps).
- Optional integration-style test for pure resolver inputs/outputs next to [`buildEncounterSpaceFromLocationMap.test.ts`](src/features/game-session/combat/buildEncounterSpaceFromLocationMap.test.ts).
- `tsc` + encounter / game-session tests as relevant.

---

## Explicitly defer (do not bundle)

- Mass combat re-export removal from encounter barrel.
- `CombatPlayView` prop renames (`encounterGrid` → neutral names).
- `SimulatorEncounterPlaySurface` or splitting `useEncounterActivePlaySurface` by host.

---

## Risks and notes for implementers

| Risk | Mitigation |
|------|------------|
| **Lifted setup state lingers** | Keep fields minimal; document in code that this is host glue for Start + building lane. |
| **Async start leaves UI stuck** | Always clear loading in `finally`; handle thrown/rejected fetch. |
| **Double navigation / double start** | Guard in-flight; ensure `handleStartEncounter` not called twice successfully. |
| **Parity drift** | Server + simulator must import the same `pickEncounterGridMap` / fallback helpers after refactor. |
| **First-floor-only assumption** | JSDoc on `resolveSimulatorMapHostLocationId`; future floor UI replaces implementation, not the pick/fallback contract. |

**Game session play surface:** No change **required** to [`GameSessionEncounterPlaySurface`](src/features/game-session/components/GameSessionEncounterPlaySurface.tsx) unless you **choose** to import the same helpers for consistency; server already resolves space for session start.

---

## Renamed / clearer helper names (suggestions)

| Current / vague | Suggested |
|-----------------|-----------|
| `getFirstFloorLocationId` | **`resolveSimulatorMapHostLocationId`** — signals simulator + map-host role and that it may change when UI allows floor pick. |
| Inline fallback in server | **`buildFallbackEncounterSpaceForSessionOrSimulator`** or **`buildGameSessionStyleFallbackGrid`** — if one shared function is used for server + simulator fallback. |
| Orchestrator in context | **`resolveEncounterSpaceForSimulatorStart`** (async) — keeps button/handler thin. |
