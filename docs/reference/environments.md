# Encounter environment (layered model)

This document describes the **Phase 0** encounter environment architecture: baseline defaults, future localized overrides, and resolved per-cell state. It is the contract for later work on magical darkness, perception, and grid rendering.

## Layers

1. **Baseline — `EncounterEnvironmentBaseline`**  
   Global/default encounter environment edited in setup (`EncounterEnvironmentSetup`). Fields:
   - `setting` — indoors / outdoors / mixed / other  
   - `lightingLevel` — bright / dim / darkness (illumination)  
   - `terrainMovement` — default movement cost class for the encounter  
   - `visibilityObscured` — none / light / heavy (obscurement from fog, foliage, etc.)  
   - `atmosphereTags` — **additive** tags from `ATMOSPHERE_TAGS` (wind, underwater, anti-magic, …)

   **Lighting and visibility stay separate.** Valid combinations include bright light + heavy obscurement, darkness + clear visibility, dim + light obscurement.

2. **Localized overrides — `EncounterEnvironmentZoneOverride[]`** (typed scaffold)  
   Future sources: spells (e.g. *Darkness*), hazards, manual zones, terrain features. Each override has:
   - `id`, `sourceKind`, optional `sourceId`  
   - `area` — `EncounterEnvironmentAreaLink` (e.g. explicit cell ids; radius and other kinds filled in when grid integration exists)  
   - `overrides` — partial `lightingLevel`, `terrainMovement`, `visibilityObscured`, and atmosphere merge/replace fields  
   - optional `magical` flags reserved for magical darkness / darkvision suppression (not interpreted in Phase 0)

3. **Resolved cell — `EncounterCellEnvironmentResolved`**  
   Result of `resolveCellEnvironment(baseline, zones, cellId)` in `environment.resolve.ts`. Per-cell fields only (baseline `setting` stays encounter-wide and is not duplicated here):
   - Scalar fields: baseline, then each applicable zone in order; **last zone wins** per field.  
   - `atmosphereTags`: baseline, then per-zone merge (replace → remove → add within each zone’s application).  
   - `appliedZoneIds`: zones that affected the cell, in order.

Constants for labels and ids live in `environment.constants.ts` (`LIGHTING_LEVELS`, `VISIBILITY_OBSCURED_LEVELS`, `ATMOSPHERE_TAGS`, …).

## Defaults

`DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE` matches the previous runtime default (outdoors, bright, normal terrain, no obscurement, no atmosphere tags).

## Non-goals (Phase 0)

- No spell-specific darkness behavior in the setup panel.  
- Grid UI (`EncounterGrid`) does not define environment semantics; it should consume resolved domain state or projections in later phases.  
- `EncounterEnvironmentAreaLink` kinds `grid-cell-radius` and `unattached` are not fully resolved yet (`cellIdInEnvironmentAreaLink` returns `false` for those until geometry exists).

## Related types

- **Extended narrative schema:** `EncounterEnvironmentExtended` (nested lighting/terrain/visibility notes) is separate from the baseline and kept for optional future campaign/doc use.

## Phase 1 pointers

- Wire battlefield effects / spells into `EncounterEnvironmentZoneOverride` with real `area` resolution.  
- Implement `grid-cell-radius` (and any templates) using the encounter grid model.  
- Drive perception and cell styling from `EncounterCellEnvironmentResolved` (or a viewer-specific projection), not ad hoc grid state.
