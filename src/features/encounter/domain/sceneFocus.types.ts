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
 * Legacy alias — prefer `SceneViewerFollowMode` (`sceneViewer.types.ts`) for new code.
 * @deprecated
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
   * Viewer explicitly focuses a tactical scene from {@link EncounterState.spacesById} (Phase C+).
   * Presentation layer filters placements to this scene; authoritative state is unchanged.
   */
  | {
      kind: 'pinnedScene'
      encounterSpaceId: string
      /** Optional campaign location key for labels (e.g. floor id). */
      sceneLocationId?: string | null
    }
