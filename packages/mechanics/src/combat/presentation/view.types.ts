/**
 * Viewer-relative **presentation** for a combatant (sidebar, initiative, header, grid metadata).
 * Derived only from existing rule seams — not a second visibility engine.
 *
 * Future: may extend with e.g. `guessed-position` when awareness presentation ships; render can then
 * branch without changing `canPerceiveTargetOccupantForCombat` / stealth reconciliation.
 */
export type ViewerCombatantPresentationKind = 'visible' | 'out-of-sight' | 'hidden'
