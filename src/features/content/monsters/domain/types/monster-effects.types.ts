import type { AbilityId } from "@/features/mechanics/domain/core/character/abilities.types";
import type { MonsterSizeCategory } from "@/features/content/monsters/domain/vocab/monster.vocab";
import type { ConditionId, DamageType, TraitRollTarget } from "./monster-combat.types";
import type { EffectDuration, EffectInterval } from "@/features/mechanics/domain/effects/timing.types";
import type {
  ActionEffect,
  ConditionEffect,
  DamageEffect,
  FormEffect,
  HitPointsEffect,
  MoveEffect,
  NoteEffect,
  RollModifierEffect,
  SaveDcSpec,
  SaveEffect,
  SpawnEffect,
  StateEffect,
} from "@/features/mechanics/domain/effects/effects.types";

export type MonsterConditionEffect = Omit<ConditionEffect, 'conditionId' | 'targetSizeMax'> & {
  conditionId: ConditionId;
  targetSizeMax?: MonsterSizeCategory;
};

export type MonsterRollModifierEffect = Omit<RollModifierEffect, 'appliesTo'> & {
  appliesTo: TraitRollTarget | TraitRollTarget[];
};

export type MonsterDamageEffect = DamageEffect & {
  damageType?: DamageType;
};

export type MonsterStateEffect = Omit<StateEffect, 'stateId' | 'targetSizeMax' | 'ongoingEffects'> & {
  stateId: string;
  targetSizeMax?: MonsterSizeCategory;
  ongoingEffects?: MonsterEffect[];
};

export type MonsterMoveEffect = MoveEffect;
export type MonsterFormEffect = Omit<FormEffect, 'allowedSizes'> & {
  allowedSizes?: MonsterSizeCategory[];
};
export type MonsterActionEffect = ActionEffect;
export type MonsterSpawnEffect = SpawnEffect;
export type MonsterNoteEffect = NoteEffect;
export type MonsterHitPointsEffect = HitPointsEffect;

export type MonsterEffect =
  | MonsterConditionEffect
  | MonsterRollModifierEffect
  | MonsterDamageEffect
  | MonsterStateEffect
  | MonsterMoveEffect
  | MonsterFormEffect
  | MonsterNoteEffect
  | MonsterActionEffect
  | { kind: 'limb'; mode: 'sever' | 'grow'; count: number }
  | MonsterSpawnEffect
  | { kind: 'resource'; resource: 'exhaustion'; mode: 'set' | 'add'; value: 'per-missing-limb' }
  | MonsterHitPointsEffect;

export type MonsterAppliedEffect =
  | MonsterConditionEffect
  | MonsterStateEffect
  | MonsterNoteEffect;

export type MonsterOnHitEffect =
  | MonsterConditionEffect
  | (Omit<SaveEffect, 'onFail' | 'onSuccess'> & {
      onFail: MonsterAppliedEffect[];
      onSuccess?: MonsterAppliedEffect[];
    })
  | MonsterDamageEffect;

export type MonsterRuleDuration = EffectDuration;

export type MonsterActionRule =
  | {
      kind: 'targeting';
      target: 'one-creature';
      targetType?: 'creature';
      rangeFeet: number;
      requiresSight?: boolean;
    }
  | {
      kind: 'apply-state';
      trigger: 'hit' | 'failed_save';
      state: string;
      targetType?: 'creature';
      duration?: MonsterRuleDuration;
      ongoingEffects?: MonsterEffect[];
      notes?: string;
    }
  | {
      kind: 'duration';
      trigger: 'hit' | 'failed_save';
      appliesTo:
        | {
            kind: 'condition';
            condition: ConditionId;
          }
        | {
            kind: 'state';
            state: string;
          };
      duration: MonsterRuleDuration;
    }
  | {
      kind: 'interval-effect';
      state: string;
      every: EffectInterval;
      effects: MonsterEffect[];
    }
  | {
      kind: 'immunity-on-success';
      trigger: 'successful_save';
      scope: 'source-action';
      duration: MonsterRuleDuration;
      notes?: string;
    }
  | {
      kind: 'death-outcome';
      trigger: 'reduced-to-0-hit-points-by-this-action';
      targetType?: 'creature';
      outcome: 'turns-to-dust';
    };

export type MonsterActionTrigger = {
  when: 'after_damage';
  targetState?: 'bloodied';
};

export type MonsterTriggeredSave = {
  ability: AbilityId;
  dc: SaveDcSpec;
  except?: {
    damageTypes?: DamageType[];
    criticalHit?: boolean;
  };
  onSuccess?: MonsterEffect[];
  onFail?: MonsterEffect[];
};
