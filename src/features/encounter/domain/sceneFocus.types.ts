/**
 * Viewer-local scene focus for encounter play surfaces (game session + simulator).
 *
 * **Not** authoritative encounter truth: combatant positions, intents, and persisted
 * {@link EncounterState} remain the source of truth for mechanics. `sceneFocus` only
 * describes **which tactical scene this viewer is looking at** in the UI.
 *
 * Future work (not Phase A):
 * - **Follow policy**: manual vs follow controlled combatant vs follow selected vs follow active turn.
 * - **Pinned / non-authoritative scenes**: requires cached {@link EncounterSpace} snapshots per
 *   location/scene or multi-space encounter state — see `SceneFocus` `pinnedScene` variant.
 * - Multi-building / outside-inside / portals: same model; "floor" is one specialization of "scene".
 */

/**
 * How the viewer’s camera could track combatants (future UX; Phase A leaves behavior as today).
 * Wired when follow modes are implemented.
 */
export type SceneFocusFollowPolicy =
  | 'manual'
  | 'followControlledCombatant'
  | 'followSelectedCombatant'
  | 'followActiveTurn'

/**
 * Discriminated union so we can add `pinnedScene` (and similar) without breaking callers.
 */
export type SceneFocus =
  | {
      kind: 'followEncounterSpace'
      /**
       * Reserved for follow-policy UX. Phase A: unused; rendering matches authoritative `EncounterState.space`.
       */
      followPolicy?: SceneFocusFollowPolicy
    }
  /**
   * Future: viewer pins the grid to a specific tactical scene while authoritative state may
   * still describe another space (e.g. after another player moves floors). Requires
   * `EncounterSpace` resolution from cache or multi-space encounter data — TODO.
   */
  | {
      kind: 'pinnedScene'
      encounterSpaceId: string
      /** Host location (floor, exterior cell, etc.) for loading/cache keys — TODO refine. */
      sceneLocationId: string
    }
