# Encounter presentation perception and POV

## Purpose

This document explains how **presentation POV** (who the tactical grid “camera” is for fog, veil, and token visibility) is chosen in the encounter client, and how that relates to **session seat**, **simulator UI**, and **scene-viewer** presentation.

Mechanics rules live in the `@rpg-world-builder/mechanics` package (e.g. `deriveEncounterPresentationGridPerceptionInput`). This page focuses on **client composition** and **host policy** so changes do not drift between Game Session play and the Encounter Simulator.

## Concepts

### `GridPerceptionInput` (presentation)

The grid pipeline consumes `GridPerceptionInput` to project visibility and immersion (e.g. magical darkness veil). It answers: *which combatant’s senses anchor this render pass?*

### `EncounterSimulatorViewerMode`

Despite the name, this is the **presentation POV mode** for the grid derivation layer: `dm` | `active-combatant` | `selected-combatant`. It maps to `GridPerceptionInput.viewerRole` (`dm` vs `pc`) inside `deriveEncounterPresentationGridPerceptionInput`.

See: `packages/mechanics/src/combat/presentation/perception/derive-encounter-presentation-grid-perception.ts`.

### `EncounterViewerContext`

`EncounterViewerContext` carries session vs simulator policy, seat, controlled combatants, and—when aligned—**the same presentation POV** used for grid derivation. `simulatorViewerMode` on this context is documented as presentation POV for grid/sidebar/header; it should match the value used to build grid perception args for **session** hosts (see below).

See: `EncounterViewerContext` in `encounter-capabilities.types.ts`.

## Canonical policy seam (encounter feature)

**`buildEncounterPresentationGridPerceptionInputArgs`** (`src/features/encounter/domain/buildEncounterPresentationGridPerceptionInputArgs.ts`) is the single place that turns **host mode + viewer inputs** into the args for `deriveEncounterPresentationGridPerceptionInput`.

- **Session (`hostMode: 'session'`)** — `simulatorViewerMode` is derived from **seat**: DM → `dm`; player/observer → `active-combatant`. `presentationSelectedCombatantId` is always `null` until product adds a session “view as” feature.
- **Simulator (`hostMode: 'simulator'`)** — passes through simulator toolbar state: `simulatorViewerMode` and `presentationSelectedCombatantId`.

Hosts (`GameSessionEncounterPlaySurface`, `EncounterRuntimeContext`) should not re-encode this policy inline.

For session, **`sessionEncounterPresentationSimulatorViewerMode(viewerRole)`** returns the same mode string used in `EncounterViewerContext.simulatorViewerMode` and in `useEncounterCombatActiveHeader`’s `simulatorViewerMode` prop, so header copy (`deriveEncounterPerceptionUiFeedback`) and the grid stay consistent.

## Scene viewer vs perception POV

These are related but separate:

- **Scene viewer** (`useEncounterSceneViewerPresentation`) — local scene focus / follow / multi-space strip; does not replace mechanics perception rules.
- **Perception POV** — this document; feeds `deriveEncounterPresentationGridPerceptionInput` after `presentationEncounterState` is resolved from scene focus.

See also: [space.md](../../space.md) for tactical space and transitions.

## Session vs simulator (product differences)

| Area | Session | Simulator |
|------|---------|-----------|
| POV switching | Seat-derived; no toolbar switcher | Full UI: `active-combatant` / `selected-combatant` / `dm` |
| `presentationSelectedCombatantId` | `null` (today) | Seeded from selection / simulator state |
| DM omniscience | Seat DM uses presentation mode `dm` | User can select DM overview in toolbar |

## Related docs

- [encounter-viewer-permissions.md](./encounter-viewer-permissions.md) — seat vs capabilities
- [grid.md](./grid.md) — grid client notes
- [game-session.md](../game-session.md) — live session play vs simulator
