import type { DiceOrFlat, dY } from '@/features/mechanics/domain/dice';
import type { CreatureTypeCondition } from '@/features/mechanics/domain/conditions/condition.types';

/** Use on effect `condition` where the **source** (e.g. attacker) must be one of these types — not for spell target selection. */
export const EXTRAPLANAR_CREATURE_TYPES: CreatureTypeCondition = {
  kind: 'creature-type',
  target: 'source',
  creatureTypes: ['aberration', 'celestial', 'elemental', 'fey', 'fiend', 'undead'],
};

/** Standard cantrip damage upgrade thresholds (levels 5, 11, 17). */
export function cantripDamageScaling(die: dY) {
  return {
    thresholds: [
      { level: 5, damage: `2${die}` as DiceOrFlat },
      { level: 11, damage: `3${die}` as DiceOrFlat },
      { level: 17, damage: `4${die}` as DiceOrFlat },
    ],
  };
}

/**
 * Authored spell level uses **0** for cantrips. For formulas that need a positive
 * spell tier (e.g. dice-per-spell-level when slots are not modeled), treat **0 as 1**.
 * Does not replace character level for cantrip damage scaling (`levelScaling` / `cantripDamageScaling`).
 */
export function effectiveSpellLevelForScaling(spellLevel: number): number {
  return spellLevel <= 0 ? 1 : spellLevel;
}

// ---------------------------------------------------------------------------
// Legacy ID → canonical kebab-case ID mapping (for migration scripts)
// ---------------------------------------------------------------------------

export const LEGACY_SPELL_ID_MAP: Record<string, string> = {
  fireBolt: 'fire-bolt',
  eldritchBlast: 'eldritch-blast',
  sacredFlame: 'sacred-flame',
  mageHand: 'mage-hand',
  magicMissile: 'magic-missile',
  cureWounds: 'cure-wounds',
  healingWord: 'healing-word',
  detectMagic: 'detect-magic',
  guidingBolt: 'guiding-bolt',
  charmPerson: 'charm-person',
  protectionFromEvil: 'protection-from-evil',
  featherFall: 'feather-fall',
  mistyStep: 'misty-step',
  spiritualWeapon: 'spiritual-weapon',
  holdPerson: 'hold-person',
  scorchingRay: 'scorching-ray',
  lesserRestoration: 'lesser-restoration',
  spiritGuardians: 'spirit-guardians',
  lightningBolt: 'lightning-bolt',
  dispelMagic: 'dispel-magic',
  removeCurse: 'remove-curse',
  dimensionDoor: 'dimension-door',
  iceStorm: 'ice-storm',
  wallOfForce: 'wall-of-force',
  greaterRestoration: 'greater-restoration',
  raiseDead: 'raise-dead',
  chainLightning: 'chain-lightning',
  powerWordStun: 'power-word-stun',
  powerWordKill: 'power-word-kill',
};
