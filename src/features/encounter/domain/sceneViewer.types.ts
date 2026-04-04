/**
 * Phase C: viewer-local follow policy layered on top of {@link SceneFocus}.
 *
 * - **Not** persisted, not authoritative — each client chooses their own follow mode.
 * - Works with authoritative multi-space encounter state (`spacesById`, per-placement `encounterSpaceId`).
 *
 * TODO (future viewer UX): persist preferences per user/campaign; DM overview / multi-pane;
 * watchlists; alerts when off-screen combatants take damage; `followActiveTurn` as first-class mode.
 */

/**
 * How the viewer’s `sceneFocus` updates as the encounter changes.
 *
 * - **manual** — only user picks (dropdown) change the viewed scene; other combatants’ stairs/teleports do not move the camera.
 * - **followSelectedCombatant** — keep the viewed scene aligned with the selected presentation/action target combatant when possible.
 * - **followControlledCombatant** — keep the viewed scene aligned with combatants this viewer controls (session PCs); prefers active combatant when it is controlled, else first controlled.
 */
export type SceneViewerFollowMode = 'manual' | 'followSelectedCombatant' | 'followControlledCombatant'
