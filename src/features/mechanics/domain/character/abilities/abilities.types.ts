import { ABILITIES } from './abilities';

export type Ability = (typeof ABILITIES)[number];
export type AbilityKey = (typeof ABILITIES)[number]['key'];
export type AbilityId = (typeof ABILITIES)[number]['id'];
export type AbilityRef = AbilityId | AbilityKey;
export type AbilityName = (typeof ABILITIES)[number]['name'];

/** PC / character builder range (typical play cap before magic). */
export type AbilityScoreValue =
  | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15
  | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25;

/** Monster and NPC stat blocks may use the full 5e score range (e.g. SRD ancient dragon, balor). */
export type MonsterAbilityScoreValue =
  | AbilityScoreValue
  | 26 | 27 | 28 | 29 | 30;

  export type AbilityScores = Record<AbilityKey, AbilityScoreValue | null>

  export type AbilityScoreMap = Partial<Record<AbilityKey | AbilityId, AbilityScoreValue | null>>;

  export type MonsterAbilityScoreMap = Partial<
    Record<AbilityKey | AbilityId, MonsterAbilityScoreValue | null>
  >;

  /** Snapshot abilities for resolution / encounter (PCs use 1–25; monsters may use up to 30). */
  export type CreatureAbilityScores = Record<AbilityKey, MonsterAbilityScoreValue>;

  export type AbilityScoreMapResolved = Record<AbilityKey, AbilityScoreValue>;
