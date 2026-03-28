# Encounter environment (layered model)

Domain contract for **baseline** encounter defaults, **localized environment zones**, and **resolved world state per grid cell**. Viewer perception and UI rendering are separate layers that may project from this data later.

## Layers

1. **Baseline — `EncounterEnvironmentBaseline`**  
   Global/default encounter environment edited in setup (`EncounterEnvironmentSetup`). Fields:
   - `setting` — indoors / outdoors / mixed / other  
   - `lightingLevel` — bright / dim / darkness (illumination)  
   - `terrainMovement` — default movement cost class for the encounter  
   - `visibilityObscured` — none / light / heavy (obscurement from fog, foliage, etc.)  
   - `atmosphereTags` — **additive** tags from `ATMOSPHERE_TAGS` (wind, underwater, anti-magic, …)

   **Lighting and visibility stay separate.** Valid combinations include bright light + heavy obscurement, darkness + clear visibility, dim + light obscurement.

2. **Localized zones — `EncounterEnvironmentZone[]`**  
   Patches, emanations, hazards (see `kind`). Each zone has `id`, optional `priority`, `sourceKind` / `sourceId`, `area` (`EncounterEnvironmentAreaLink`), partial `overrides` (including optional `setting`), and optional `magical` flags (`magical`, `magicalDarkness`, `blocksDarkvision`).

3. **Encounter state**  
   `EncounterState.environmentBaseline` and `EncounterState.environmentZones` (optional on older snapshots; `createEncounterState` sets defaults). Baseline is copied from setup when the encounter starts.

4. **Resolved world cell — `EncounterWorldCellEnvironment`**  
   Pure **world/environment** state at a cell — not viewer perception, not render state. Produced by `resolveWorldEnvironmentForCell` / `buildResolvedWorldEnvironmentCellMap` / `resolveWorldEnvironmentFromEncounterState`.

## Area linkage (`EncounterEnvironmentAreaLink`)

- **`grid-cell-ids`** — explicit membership.  
- **`sphere-ft`** — preferred; matches battlefield AoE: Chebyshev distance in feet vs `originCellId` (`gridDistanceFt` ≤ `radiusFt`).  
- **`grid-cell-radius`** — deprecated; converted to feet via `radiusCells × cellFeet` when `space` is provided.  
- **`unattached`** — covers no cells.

Use `cellIdInEnvironmentArea(space, area, cellId)` for membership (requires `EncounterSpace` for sphere-like shapes).

## Merge and precedence

1. **Applicable zones** — zones whose area contains `cellId`.  
2. **Sort** — `sortZonesForMerge`: ascending `priority` (default `0`), then ascending `id` (stable tie-break).  
3. **Scalars** (`setting`, `lightingLevel`, `terrainMovement`, `visibilityObscured`) — start from baseline; each sorted applicable zone may override; **last in sorted order wins** (higher numeric `priority` wins when both set a field).  
4. **`atmosphereTags`** — start from baseline; for each zone in sorted order: **replace** (if set) → **remove** → **add**.  
5. **Magical flags** — `magicalDarkness`, `blocksDarkvision`, `magical`: **OR** across applicable zones (any zone sets true → true).

## API (see `environment.resolve.ts`)

| Function | Purpose |
|----------|---------|
| `resolveWorldEnvironmentForCell(baseline, zones, space, cellId)` | Resolve one cell |
| `buildResolvedWorldEnvironmentCellMap(baseline, zones, space)` | Map every `space.cells` id → resolved |
| `resolveWorldEnvironmentFromEncounterState(state, cellId)` | Uses `state.environmentBaseline` / `environmentZones` with defaults |
| `resolveCellEnvironment(baseline, zones, cellId, space?)` | Legacy; without `space`, only `grid-cell-ids` areas match |

## Defaults

`DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE` matches the runtime default (outdoors, bright, normal terrain, no obscurement, no atmosphere tags).

## Non-goals

- No viewer perception or token hiding in this module.  
- Grid UI (`EncounterGrid`) must not define environment semantics; use resolved world state or projections.  
- Spell/action resolution does not yet create `environmentZones` rows (see TODO in `attached-aura-mutations.ts`).

## Related types

- **`EncounterEnvironmentExtended`** — optional narrative/campaign schema; not the tactical baseline.

## Next phases

- **Viewer perception** — project from `EncounterWorldCellEnvironment` + creature senses.  
- **Darkness / veil rendering** — separate render projection; do not use `CellBaseFillKind` as environment source of truth.  
- **Spell integration** — spawn `EncounterEnvironmentZone` with `sphere-ft` from cast placement / `resolveBattlefieldEffectOriginCellId` patterns where appropriate.
