# Combat Glossary

## Purpose

This glossary defines the main terms used across combat architecture and refactor docs.

These terms should stay stable unless there is a deliberate naming change.

## Combat
The reusable combat system concept.

Usually refers to:
- shared combat engine
- reusable combat UI
- combat runtime concepts
- truth-changing flows

Combat is broader than any one feature screen.

## Encounter Simulator
The **dev/testing** product surface that hosts local combat workflow: fast setup, any roster, one operator controls all combatants. Implemented under `src/features/encounter` (URLs may still use the path segment `encounter`).

Usually refers to:
- simulator setup flow
- active combat screen composition
- operator workflow in this sandbox
- feature-specific wrappers, shells, and orchestration

The Encounter Simulator is a consumer of combat. It is **not** **GameSession** (see below).

**Tactical space (simulator start):** **Start combat** resolves **`EncounterSpace`** with the same **map-first** contract as game-session combat: choose a **map host** (first **floor** under the **building** selected in setup), then **`listLocationMaps`** → default **encounter-grid** map → **`buildEncounterSpaceFromLocationMap`** (`src/features/game-session/combat/buildEncounterSpaceFromLocationMap.ts`); if none, a **10×10** fallback square grid tied to that floor (or a generic fallback when no host). Shared picks live in **`encounterSpaceResolution.ts`**; the async entry point is **`resolveEncounterSpaceForSimulatorStart`** (`src/features/game-session/combat/resolveEncounterSpaceForSimulatorStart.ts`). The old **grid size preset** UI is not used for simulator start.

## GameSession
Campaign-scoped **live-play session** container: DM-facing setup, **lobby**, **`/play`**, lifecycle status. Implemented under `src/features/game-session` (distinct from calendar Sessions and from the Encounter Simulator). See [game-session.md](./game-session.md).

**Today:** list/setup/lobby/play routes, lifecycle (`draft` → `scheduled` → `lobby` → `active` → …), planning field `scheduledFor` (informational; lobby opens via explicit DM action), ephemeral **lobby presence** (Socket.IO), expected party display from the campaign roster (first pass). When the session record has **`activeEncounterId`**, **`/play`** loads that persisted combat session and renders the shared **Combat play view** shell with HTTP intent mirroring.

**Not yet (combat-relevant):** WebSocket **combat** broadcast to all participants and polished **stale revision (409)** UX—see [roadmap.md](./roadmap.md). **Game-session–linked** play already resolves **viewer seat** (DM / player / observer) and **controlled combatants** for client UX and **server apply-intent** (**403** when the user may not act); richer **participant** modeling and orphan-session **campaign** tenancy are still incremental—see [client/encounter-viewer-permissions.md](./client/encounter-viewer-permissions.md).

## Combat play view
Shared **active encounter** layout shell (**`CombatPlayView`** in `src/features/combat`): header slot, grid, sidebar, drawers, toasts. Composed by **`useEncounterActivePlaySurface`** for both the **Encounter Simulator** active route and **GameSession `/play`**. Sticky-header layout metrics are **passed in as props** (e.g. CSS var + px fallback for grid hover line positioning) so this module does not import encounter theme code. Simulator-only controls (e.g. presentation POV, edit encounter) stay in the **`encounter`** feature, not in this shell.

## Viewer seat (session mode)
In **GameSession `/play`** (not the Encounter Simulator), the client resolves **`viewerRole`** (**`dm`** | **`player`** | **`observer`**) and **`controlledCombatantIds`** before **`deriveEncounterCapabilities`**. **`dmUserId`** and **`participants`** on the game session document are used when present; if a logged-in player is missing from **`participants`**, seat may be **inferred** from **campaign roster** character ownership and **party PC** combatants in **`EncounterState`**. The server **`POST .../intents`** path uses the same rules when the combat is **game-session–linked**. See [client/encounter-viewer-permissions.md](./client/encounter-viewer-permissions.md).

## Shared combat engine
The pure/shared layer that owns combat truth.

It includes:
- state
- resolution
- selectors
- pure derivation
- intents/results/events

It is designed to be reusable by both client and server.

## Client combat UI
The reusable client-only combat-facing UI layer.

It includes:
- reusable components
- **`CombatPlayView`** (shared active play layout; see **Combat play view**)
- client presentation helpers
- renderer-level primitives
- optional reusable combat hooks

It does not own truth.

## Combat space
The normalized runtime board/space representation used during live combat.

It includes concepts like:
- cells
- obstacles
- blockers
- runtime visibility/cover/terrain state

It is different from authored floor/map editor data.

## Location floor
An authored content model representing a floor/map in the location editor/content domain.

It belongs to authored content, not live combat runtime.

## Combat seed
A normalized startup/runtime input derived from authored content and other setup information that is used to initialize combat runtime state.

## Intent
A truth-changing request submitted by UI or another caller.

Examples:
- end turn
- move combatant
- resolve action
- place area
- choose spawn cell

Intents should be explicit and serializable.

## Event
A canonical record of something that happened as a result of combat resolution.

Events are useful for:
- logs
- toasts
- timelines
- replay/rebuild flows
- server broadcast

## Result
The structured outcome of handling an intent.

A result may include:
- success/failure
- validation issues
- produced events
- updated state or state references

## Selector
A pure derived-state function that summarizes or extracts useful information from canonical combat state.

## Pure presentation derivation
A pure/shared derivation layer that produces reusable display-oriented models from combat state without becoming client-rendering code.

This belongs closer to engine ownership than client-only rendering helpers.

## Client presentation helper
A client-only helper that formats or maps combat data for rendering concerns such as:
- chips
- tooltips
- modal/card stat display
- UI-only formatting

This belongs to client combat UI, not the shared engine.

## Shell
A feature-owned orchestration component that composes reusable primitives and manages workflow/state coordination.

Examples:
- drawer shells
- modal shells
- panel shells

## Wrapper
A thin adapter component that maps feature-specific state/props into reusable combat-owned component props.

## Panel
A smaller UI leaf component, often prop-driven, that may be reusable even when its parent shell is not.

## Authoritative state
The canonical source of truth for combat state.

For **multiplayer / live play**, authoritative snapshots are intended to live on the **server** and be broadcast to clients. Today, the **Encounter Simulator** may still apply mechanics **locally** while the server exposes a **persisted** combat session API for the same seams—see [roadmap.md](./roadmap.md). **GameSession `/play`** **calls** HTTP load and intent apply for the persisted session referenced by **`activeEncounterId`**; realtime **combat** broadcast is still outstanding—see [game-session.md](./game-session.md).

## Persisted combat session (server)
A server-owned record tying a **`sessionId`** to the latest **`EncounterState` snapshot**, a monotonic **`revision`**, and timestamps. Clients send **`baseRevision`** when applying an intent so the server can reject **stale** concurrent updates. This is snapshot-first persistence, not full event sourcing.

## Revision (combat session)
An integer incremented when a successful intent mutation commits a new snapshot. Used for optimistic concurrency (`baseRevision` must match the stored revision).

## Local UI state
Temporary client-only interaction state that should not be treated as canonical combat truth.

Examples:
- hover state
- open/closed modals
- temporary selection preview
- unconfirmed area placement