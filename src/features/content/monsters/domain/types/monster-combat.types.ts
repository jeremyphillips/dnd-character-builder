import type { AbilityId } from '@/features/mechanics/domain/character';
import type { WeaponDamageType } from "@/features/content/equipment/weapons/domain/vocab";

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

export type DamageType =
  | WeaponDamageType
  | 'fire'
  | 'acid'
  | 'radiant'
  | 'necrotic';

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
