import { standardAlignments } from './alignments'
import { FULL_CASTER_SLOTS_5E, HALF_CASTER_SLOTS_5E } from './spellSlotTables'
import type { WealthTier } from '@/data/classes.types'
import type { MagicItemRarity } from '@/data/equipment/magicItems'
import type { AbilityId } from '@/shared/types/character.core'
import type {
  ResolveMode,
  RuleOverrideMap,
  RuleConfig,
  ArrayMergeMode,
  MergePolicy,
} from '@/features/mechanics/domain/core/rules/ruleConfig'

export type {
  ResolveMode,
  RuleOverrideMap,
  RuleConfig,
  ArrayMergeMode,
  MergePolicy,
}

// ---------------------------------------------------------------------------
// Ruleset types
// ---------------------------------------------------------------------------

export type AttackResolution = 'to_hit' | 'thac0' | 'matrix'

export type DerivedCombat = {
  attackResolution: AttackResolution
  thac0?: number
  savingThrows?: Record<string, number>
  armorClass: number
}

export type ClassId = string;
export type RaceId = string;


export type AbilityRequirement = {
  ability: AbilityId;
  min: number;
};

/**
 * One AND group: all requirements must be met
 */
export type AbilityRequirementGroup = {
  all: AbilityRequirement[];
};

/**
 * OR across groups: any group can satisfy the requirement
 */
export type ClassEntryRequirement = {
  // if anyOf array is empty or undefined, the requirement is not met
  anyOf: AbilityRequirementGroup[];
};


export type MulticlassingRuleSet = {
  enabled: boolean
  maxClasses?: number
  minLevelToMulticlass?: number
  /**
   * Requirements to take the first level in the *target* class.
   * Keyed by target classId.
   */
  defaultEntryRequirement?: ClassEntryRequirement; // applies to any target class unless overridden
  entryRequirementsByTargetClass?: Record<ClassId, ClassEntryRequirement>; // overrides per target

  xpMode?: 'shared' | 'per_class'
}

export type MulticlassingRules = RuleConfig<
  MulticlassingRuleSet,
  Partial<MulticlassingRuleSet>
>;

export type AlignmentOption = {
  id: string;        // stored on character
  name: string;      // display label
  tags?: string[];   // optional: ["lawful","good"]
}

export type AlignmentRules = {
  enabled: boolean;
  options: AlignmentOption[];
  // optional: for UI grouping/validation
  axes?: Array<{
    id: 'ethics' | 'morality' | string;
    values: Array<{ id: string; name: string }>;
  }>;
  defaultId?: string;     // e.g. "n" or "unaligned"
  allowCustom?: boolean;  // if you ever want freeform
}

export type StartingWealthRules = {
  /**
   * How level 1 starting gold is determined.
   * Keep flexible because different systems do different things.
   */
  level1:
    | { mode: 'fixed'; gp: number }
    | { mode: 'by_class'; formulaByClassId: Record<string, string> } // e.g. "5d4*10"
    | { mode: 'by_class'; defaultFormula: string; overrides?: Record<string, string> };

  /**
   * For higher-level starts (or late-join PCs): tiers.
   */
  tiers?: WealthTier[]

  /**
   * Currency + rounding knobs, if you need them later.
   */
  currency?: { base: 'gp' | 'sp' | 'cp' };
}

export type LevelingRules = {
  levelCap: number
  mode: 'xp' | 'milestone'
  xpTable?: Array<{ level: number; xpRequired: number }>
}

export type ProficiencyRules = {
  bonusByLevel: number[] // index 1..20
}

export type AbilityRules = {
  ids: AbilityId[]
  mod: { kind: '5e_default' } // or formula later
}

export type RestRules = {
  shortRestMinutes: number
  longRestMinutes: number
  hitDiceRecoveryOnLongRest: { kind: 'half_total' | 'all' | 'none' }
}


export type MechanicsRules = {
  progression: Progression
  combat: DerivedCombat
  character: {
    alignment: AlignmentRules
    abilities?: AbilityRules
    proficiency?: ProficiencyRules
  }
  resting?: RestRules
}

export type SpellSlotTable = readonly number[][]

export type SpellcastingProgression = {
  slotTables: {
    fullCaster?: SpellSlotTable
    halfCaster?: SpellSlotTable
    // thirdCaster?: SpellSlotTable
  }
}

export interface MagicItemBudgetTier {
  levelRange: [number, number]
  /** Maximum rarity allowed at this level (5e).  Undefined if the edition
   *  doesn't use rarity gating (4e, 3e). */
  maxRarity?: MagicItemRarity
  /** How many permanent items the character should have by now */
  permanentItems: number
  /** How many consumables (potions, scrolls) */
  consumableItems: number
  /** Max attunement slots — 5e: 3, others: undefined (no attunement system) */
  maxAttunement?: number
  /** 3e/3.5e: max GP value of a single item at this tier */
  maxItemValueGp?: number
}

export type MagicItemBudget = {
  /** Maximum simultaneous attunement slots (5e: 3, others: undefined) */
  maxAttunement?: number
  tiers: MagicItemBudgetTier[]
}

export type Progression = {
  multiclassing: MulticlassingRules
  starting: {
    wealth: StartingWealthRules
  },
  leveling?: LevelingRules
  spellcasting: SpellcastingProgression
  magicItemBudget: MagicItemBudget
  // stores class-specific overrides to the default ruleset
  overrides?: {
    byClassId?: Record<string, {
      levelCap?: number
      xpTable?: Array<{ level: number; xpRequired: number }>
      startingWealthFormula?: string
    }>
  }
}

export type Patch = unknown
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export type ContentPolicy = {
  allowAll?: boolean
  allow?: string[]
  deny?: string[]
  overrides?: Record<id, Patch>
  /** Brand-new campaign-specific resources keyed by id */
  custom?: Record<id, Resource>
}

export type RulesetContent = {
  classes: ContentPolicy
  races: ContentPolicy
  equipment: ContentPolicy
  spells: ContentPolicy
  monsters: ContentPolicy
  locations: ContentPolicy
}

export type CampaignTagOption = {
  id: string;
  name: string;
  description?: string;
};

export type CampaignTagCategory = {
  id: string;
  name: string;
  options: CampaignTagOption[];
}

// DB-provided “catalog”
export type CampaignTagsOptions = CampaignTagCategory[];

// Persisted user state
export type CampaignTagsState = {
  selected: string[];        // option ids and/or custom ids (see note below)
  allowCustom?: boolean;
  custom?: string[];         // raw custom strings
};

export type CampaignTagsConfig = CampaignTagCategory[]

export type Ruleset = {
  _id: string
  campaignId: string
  meta: {
    name: string
    basedOn?: string
    version: number
    /** Campaign tone + content descriptors chosen by the campaign owner */
    campaignTags?: CampaignTagsState
  }
  content: RulesetContent
  mechanics: MechanicsRules
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

export const startingWealthTiersDefault: WealthTier[] = [
  { levelRange: [1, 4],   baseGold: 125,  maxItemValue: 75 },
  { levelRange: [5, 10],  baseGold: 500,  maxItemValue: 200 },
  { levelRange: [11, 20], baseGold: 5000, maxItemValue: 2000 },
];

// TODO: keep CAMPAIGN_TAG_OPTIONS somewhere else (a config fetch / separate field / UI state).
export type CampaignTagsVM = CampaignTagsState & {
  options: CampaignTagsOptions;
};

export const toCampaignTagsVM = (
  state: CampaignTagsState | undefined,
  options: CampaignTagsOptions,
): CampaignTagsVM => ({
  selected: state?.selected ?? [],
  allowCustom: state?.allowCustom ?? true,
  custom: state?.custom ?? [],
  options,
});

// ---------------------------------------------------------------------------
// System ruleset — code-defined 5e baseline
//
// These are the "factory defaults" shared by every campaign that inherits
// from 5e.  In a real deployment this object lives in code (or a read-only
// system collection); it is never mutated by campaign owners.
// ---------------------------------------------------------------------------

const SYSTEM_RULESET_5E: Ruleset = {
  _id: 'system_5e',
  campaignId: '',
  meta: {
    name: '5e System Defaults',
    basedOn: '5e',
    version: 1,
  },
  content: {
    classes:    { allowAll: true },
    races:      { allowAll: true },
    equipment:  { allowAll: true },
    spells:     { allowAll: true },
    monsters:   { allowAll: true },
    locations:  { allowAll: true },
  },
  mechanics: {
    progression: {
      multiclassing: {
        mode: 'use_default',
        default: {
          enabled: true,
          minLevelToMulticlass: 2,
          xpMode: 'shared',
          entryRequirementsByTargetClass: {
            sorcerer: {
              anyOf: [{ all: [{ ability: 'charisma', min: 13 }] }],
            },
          },
        },
      },
      starting: {
        wealth: {
          level1: { mode: 'by_class', defaultFormula: '5d4 * 10' },
          tiers: startingWealthTiersDefault,
        },
      },
      spellcasting: {
        slotTables: {
          fullCaster: FULL_CASTER_SLOTS_5E,
          halfCaster: HALF_CASTER_SLOTS_5E,
        },
      },
      magicItemBudget: {
        maxAttunement: 3,
        tiers: [
          { levelRange: [1, 4],   maxRarity: 'uncommon',  permanentItems: 2,  consumableItems: 9 },
          { levelRange: [5, 10],  maxRarity: 'rare',      permanentItems: 6,  consumableItems: 28 },
          { levelRange: [11, 16], maxRarity: 'very-rare', permanentItems: 6,  consumableItems: 24 },
          { levelRange: [17, 20], maxRarity: 'legendary', permanentItems: 6,  consumableItems: 19 },
        ],
      },
    },
    character: {
      alignment: {
        enabled: true,
        defaultId: 'n',
        options: standardAlignments,
      },
    },
    combat: {
      armorClass: 10,
      attackResolution: 'to_hit',
    },
  },
};

// ---------------------------------------------------------------------------
// Campaign patch — simulates a DB-stored campaign record
//
// Only the fields the campaign owner changed are present; everything else
// falls through from the system ruleset via mergeRuleset().
// ---------------------------------------------------------------------------

export type CampaignRulesetPatch = {
  _id: string;
  campaignId: string;
} & DeepPartial<Omit<Ruleset, '_id' | 'campaignId'>>;

const CAMPAIGN_PATCH_LANKHMAR: CampaignRulesetPatch = {
  _id: 'testruleset01',
  campaignId: '698a7c82c35d1758cfa4f4c3',
  meta: {
    name: 'Lankhmar 5e Ruleset',
    campaignTags: {
      selected: [],
      allowCustom: true,
      custom: [],
    },
  },
  content: {
    classes: { allowAll: true, deny: ['warlock'] },
    races: { allow: ['human'] },
  },
  mechanics: {
    progression: {
      multiclassing: {
        default: {
          entryRequirementsByTargetClass: {
            wizard: {
              anyOf: [{ all: [{ ability: 'intelligence', min: 18 }] }],
            },
          },
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Merge helper
//
// Shallow-merges at each nesting level down to
// mechanics.progression.multiclassing.default, then performs a keyed map
// merge for entryRequirementsByTargetClass so system keys and campaign keys
// coexist (campaign keys win on collision).
// ---------------------------------------------------------------------------

function mergeRuleset(system: Ruleset, patch: CampaignRulesetPatch): Ruleset {
  const sMcDefault = system.mechanics.progression.multiclassing.default;
  const pMc = patch.mechanics?.progression?.multiclassing;
  const pMcDefault = pMc?.default;

  const mergedEntryReqs: Record<ClassId, ClassEntryRequirement> = {
    ...(sMcDefault.entryRequirementsByTargetClass ?? {}),
    ...((pMcDefault?.entryRequirementsByTargetClass ?? {}) as Record<ClassId, ClassEntryRequirement>),
  };

  const mergedMcDefault: MulticlassingRuleSet = {
    ...sMcDefault,
    ...((pMcDefault ?? {}) as Partial<MulticlassingRuleSet>),
    entryRequirementsByTargetClass: Object.keys(mergedEntryReqs).length > 0
      ? mergedEntryReqs
      : undefined,
  };

  const sMc = system.mechanics.progression.multiclassing;
  const mergedMc: MulticlassingRules = {
    ...sMc,
    ...((pMc ?? {}) as Partial<MulticlassingRules>),
    default: mergedMcDefault,
  };

  const sProg = system.mechanics.progression;
  const mergedProg: Progression = {
    ...sProg,
    ...((patch.mechanics?.progression ?? {}) as Partial<Progression>),
    multiclassing: mergedMc,
  };

  const mergedMechanics: MechanicsRules = {
    ...system.mechanics,
    ...((patch.mechanics ?? {}) as Partial<MechanicsRules>),
    progression: mergedProg,
  };

  return {
    _id: patch._id,
    campaignId: patch.campaignId,
    meta: { ...system.meta, ...(patch.meta ?? {}) } as Ruleset['meta'],
    content: { ...system.content, ...(patch.content ?? {}) } as RulesetContent,
    mechanics: mergedMechanics,
  };
}

// ---------------------------------------------------------------------------
// Final assembled rulesets
// ---------------------------------------------------------------------------

const lankhmarRuleset = mergeRuleset(SYSTEM_RULESET_5E, CAMPAIGN_PATCH_LANKHMAR);

export const ruleSets: Ruleset[] = [lankhmarRuleset];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export const ruleSetsById: Record<string, Ruleset> = Object.fromEntries(
  ruleSets.map(r => [r._id, r]),
);

export const defaultRulesetId = 'testruleset01';

export const defaultRuleset: Ruleset = ruleSetsById[defaultRulesetId];
