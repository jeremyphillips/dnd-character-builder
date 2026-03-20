import type { AbilityId } from '@/features/mechanics/domain/character';
export type { DamageType } from '@/features/mechanics/domain/damage/damage.types';

export type AttackAbility = AbilityId;

export type MonsterAttackType =
  | 'claw'
  | 'bite'
  | 'beak'
  | 'tail'
  | 'wing'
  | 'horn'
  | 'hoof'
  | 'fang'
  | 'talon'
  | 'pseudopod'
  | 'slam'
  | 'constrict'
  | 'touch';

export type TraitRollTarget =
  | 'attack-rolls'
  | 'ability-checks'
  | 'saving-throws';

export type ImmunityType =
  | 'fire'
  | 'acid'
  | 'cold'
  | 'lightning'
  | 'thunder'
  | 'poison'
  | 'necrotic'
  | 'radiant'
  | 'psychic'
  | 'force'
  | 'bludgeoning'
  | 'piercing'
  | 'slashing'
  | 'charmed'
  | 'exhaustion'
  | 'blinded'
  | 'deafened'
  | 'frightened'
  | 'grappled'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious';

export type VulnerabilityType =
  | 'bludgeoning'
  | 'fire'
  | 'thunder';

/** Damage types used for `mechanics.resistances` (half damage). */
export type MonsterResistanceType =
  | 'bludgeoning'
  | 'piercing'
  | 'slashing'
  | 'fire'
  | 'cold'
  | 'acid'
  | 'lightning'
  | 'thunder'
  | 'poison'
  | 'necrotic'
  | 'radiant'
  | 'psychic'
  | 'force';
