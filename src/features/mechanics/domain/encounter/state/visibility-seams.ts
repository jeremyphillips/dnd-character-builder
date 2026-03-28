/**
 * Encounter visibility: line-of-sight stubs and shared combatant-pair “see occupant” semantics.
 */
export { lineOfSightClear, lineOfEffectClear } from './visibility-los'
export {
  canSeeForTargeting,
  canPerceiveTargetOccupantForCombat,
  resolveCombatantPairVisibilityForAttackRoll,
  getAttackVisibilityRollModifiersFromPair,
} from './combatant-pair-visibility'
