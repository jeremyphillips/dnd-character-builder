/**
 * System spell catalog — code-defined spell entries per system ruleset.
 *
 * These are the "factory defaults" for spells (SRD_CC_v5_2_1). Campaign-owned
 * custom spells would be stored in the DB and merged at runtime.
 *
 * Fully-authored spells include all SpellBase fields.
 * Stub entries use SpellEntry and are minimally typed until authoring reaches them.
 */
import type { Spell, SpellBase } from '@/features/content/spells/domain/types';
import type { DiceOrFlat, dY } from '@/features/mechanics/domain/dice';
import type { CreatureTypeCondition } from '@/features/mechanics/domain/conditions/condition.types';
import type { SystemRulesetId } from '../types/ruleset.types';
import { DEFAULT_SYSTEM_RULESET_ID } from '../ids/systemIds';

const EXTRAPLANAR_CREATURE_TYPES: CreatureTypeCondition = {
  kind: 'creature-type',
  target: 'source',
  creatureTypes: ['aberration', 'celestial', 'elemental', 'fey', 'fiend', 'undead'],
};

/** Standard cantrip damage upgrade thresholds (levels 5, 11, 17). */
function cantripDamageScaling(die: dY) {
  return {
    thresholds: [
      { level: 5, damage: `2${die}` as DiceOrFlat },
      { level: 11, damage: `3${die}` as DiceOrFlat },
      { level: 17, damage: `4${die}` as DiceOrFlat },
    ],
  };
}

type SpellEntry = Partial<SpellBase> & Pick<SpellBase, 'id' | 'name' | 'school' | 'level' | 'classes' | 'effects'>;

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

// ---------------------------------------------------------------------------
// 5e v1 system spells (SRD_CC_v5_2_1)
// ---------------------------------------------------------------------------

const SPELLS_RAW: readonly SpellEntry[] = [
  {
    id: 'fire-bolt',
    name: 'Fire Bolt',
    school: 'evocation',
    level: 0,
    classes: ['sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 120, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    deliveryMethod: 'ranged-spell-attack',
    effects: [
      { kind: 'targeting', target: 'one-creature', targetType: 'creature' },
      {
        kind: 'damage',
        damage: '1d10',
        damageType: 'fire',
        levelScaling: cantripDamageScaling('d10'),
      },
      {
        kind: 'note',
        text: "A flammable object hit by this spell starts burning if it isn't being worn or carried.",
      },
    ],
    description: {
      full: "You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn't being worn or carried. Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10).",
      summary: 'Ranged spell attack dealing 1d10 fire damage; flammable objects start burning.',
    },
  },
  {
    id: 'eldritch-blast',
    name: 'Eldritch Blast',
    school: 'evocation',
    level: 0,
    classes: ['warlock'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 120, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    deliveryMethod: 'ranged-spell-attack',
    effects: [
      {
        kind: 'targeting',
        target: 'chosen-creatures',
        targetType: 'creature',
        canSelectSameTargetMultipleTimes: true,
      },
      {
        kind: 'damage',
        damage: '1d10',
        damageType: 'force',
        instances: { count: 1, canSplitTargets: true, canStackOnSingleTarget: true },
        levelScaling: {
          thresholds: [
            { level: 5, instances: 2 },
            { level: 11, instances: 3 },
            { level: 17, instances: 4 },
          ],
        },
      },
      {
        kind: 'note',
        text: 'Each beam requires a separate ranged spell attack roll.',
      },
    ],
    description: {
      full: 'You hurl a beam of crackling energy. Make a ranged spell attack against one creature or object in range. On a hit, the target takes 1d10 Force damage. Cantrip Upgrade. The spell creates two beams at level 5, three beams at level 11, and four beams at level 17. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam.',
      summary: 'Ranged spell attack dealing 1d10 force damage per beam; beam count increases at levels 5, 11, and 17.',
    },
  },
  {
    id: 'sacred-flame',
    name: 'Sacred Flame',
    school: 'evocation',
    level: 0,
    classes: ['cleric'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    effects: [
      { kind: 'targeting', target: 'one-creature', targetType: 'creature', requiresSight: true },
      {
        kind: 'save',
        save: { ability: 'dex' },
        onFail: [{
          kind: 'damage',
          damage: '1d8',
          damageType: 'radiant',
          levelScaling: cantripDamageScaling('d8'),
        }],
      },
      {
        kind: 'note',
        text: 'The target gains no benefit from Half Cover or Three-Quarters Cover for this save.',
      },
    ],
    description: {
      full: 'Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 Radiant damage. The target gains no benefit from Half Cover or Three-Quarters Cover for this save. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8).',
      summary: 'A creature you can see makes a Dexterity save or takes 1d8 radiant damage; ignores half and three-quarters cover.',
    },
  },
  {
    id: 'mage-hand',
    name: 'Mage Hand',
    school: 'conjuration',
    level: 0,
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'prestidigitation',
    name: 'Prestidigitation',
    school: 'transmutation',
    level: 0,
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'light',
    name: 'Light',
    school: 'evocation',
    level: 0,
    classes: ['bard', 'cleric', 'sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'touch' },
    duration: { kind: 'timed', value: 1, unit: 'hour' },
    components: { verbal: true, material: { description: 'a firefly or phosphorescent moss' } },
    effects: [
      {
        kind: 'targeting',
        target: 'one-creature',
        targetType: 'creature',
      },
      {
        kind: 'note',
        text: 'You touch one object that is no larger than 10 feet in any dimension. The object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.',
      },
    ],
    description: {
      full: 'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like. Completely covering the object with something opaque blocks the light. The spell ends if you cast it again or dismiss it as an action.',
      summary: 'An object you touch sheds bright light in a 20-foot radius for 1 hour.',
    },
  },
  {
    id: 'acid-splash',
    name: 'Acid Splash',
    school: 'evocation',
    level: 0,
    classes: ['sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    effects: [
      {
        kind: 'note',
        text: '5-foot sphere; creatures make Dex save or take 1d6 acid damage. Scales at 5/11/17.',
      },
    ],
    description: {
      full: "You create an acidic bubble at a point within range, where it explodes in a 5-foot-radius Sphere. Each creature in that Sphere must succeed on a Dexterity saving throw or take 1d6 Acid damage. Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6).",
      summary: '5-foot sphere; Dex save or 1d6 acid damage. Scales at levels 5, 11, 17.',
    },
  },

  // ---------------------------------------------------------------------------
  // Level 1
  // ---------------------------------------------------------------------------
  {
    id: 'alarm',
    name: 'Alarm',
    school: 'abjuration',
    level: 1,
    classes: ['ranger', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'minute' }, alternate: [{ value: 1, unit: 'minute', ritual: true }] },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 8, unit: 'hour' },
    components: { verbal: true, somatic: true, material: { description: 'a bell and silver wire' } },
    effects: [
      {
        kind: 'note',
        text: 'Wards door, window, or 20-foot cube. Alerts when touched. Audible or mental alarm.',
      },
    ],
    description: {
      full: "You set an alarm against intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot Cube. Until the spell ends, an alarm alerts you whenever a creature touches or enters the warded area. When you cast the spell, you can designate creatures that won't set off the alarm. You also choose whether the alarm is audible or mental: Audible Alarm. The alarm produces the sound of a handbell for 10 seconds within 60 feet of the warded area. Mental Alarm. You are alerted by a mental ping if you are within 1 mile of the warded area. This ping awakens you if you're asleep.",
      summary: 'Wards an area; alerts when creatures touch or enter. Audible or mental alarm.',
    },
  },
  {
    id: 'animal-friendship',
    name: 'Animal Friendship',
    school: 'enchantment',
    level: 1,
    classes: ['bard', 'druid', 'ranger'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 24, unit: 'hour' },
    components: { verbal: true, somatic: true, material: { description: 'a morsel of food' } },
    effects: [
      {
        kind: 'note',
        text: 'Beast makes Wis save or is Charmed for 24 hours. Ends if you or allies damage it.',
      },
    ],
    description: {
      full: "Target a Beast that you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. If you or one of your allies deals damage to the target, the spells ends. Using a Higher-Level Spell Slot. You can target one additional Beast for each spell slot level above 1.",
      summary: 'Beast makes Wis save or is Charmed for 24 hours. Scales with extra targets.',
    },
  },
  {
    id: 'magic-missile',
    name: 'Magic Missile',
    school: 'evocation',
    level: 1,
    classes: ['sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 120, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    effects: [
      {
        kind: 'targeting',
        target: 'chosen-creatures',
        targetType: 'creature',
        rangeFeet: 120,
        requiresSight: true,
        count: 3,
        canSelectSameTargetMultipleTimes: true,
      },
      {
        kind: 'damage',
        damage: '1d4+1',
        damageType: 'force',
        instances: {
          count: 3,
          simultaneous: true,
          canSplitTargets: true,
          canStackOnSingleTarget: true,
        },
      },
      {
        kind: 'note',
        text: 'Each dart hits automatically and can be directed at one creature or split among several creatures you can see within range.',
      },
    ],
    scaling: [{ category: 'extra-damage', description: 'One additional dart per slot level above 1st.', mode: 'per-slot-level', startsAtSlotLevel: 1 }],
    description: {
      full: 'You create three glowing darts of magical force. Each dart strikes a creature of your choice that you can see within range. A dart deals 1d4 + 1 Force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several.',
      summary: 'Three automatic-hit darts deal 1d4 + 1 force damage each and can be split among visible creatures in range.',
    },
  },
  {
    id: 'shield',
    name: 'Shield',
    school: 'abjuration',
    level: 1,
    classes: ['sorcerer', 'wizard'],
    castingTime: {
      normal: {
        value: 1,
        unit: 'reaction',
        trigger: 'when you are hit by an attack or targeted by the magic missile spell',
      },
    },
    range: { kind: 'self' },
    duration: {
      kind: 'until-turn-boundary',
      subject: 'self',
      turn: 'next',
      boundary: 'start',
    },
    components: { verbal: true, somatic: true },
    effects: [
      {
        kind: 'modifier',
        target: 'armor_class',
        mode: 'add',
        value: 5,
        text: 'Including against the triggering attack.',
      },
      {
        kind: 'immunity',
        scope: 'spell',
        spellIds: ['magic-missile'],
        duration: {
          kind: 'until-turn-boundary',
          subject: 'self',
          turn: 'next',
          boundary: 'start',
        },
        notes: 'You take no damage from Magic Missile.',
      },
    ],
    description: {
      full: 'An imperceptible barrier of magical force protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from Magic Missile.',
      summary: 'Reaction spell that grants +5 AC until the start of your next turn and negates Magic Missile damage.',
    },
  },
  {
    id: 'cure-wounds',
    name: 'Cure Wounds',
    school: 'abjuration',
    level: 1,
    classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'touch' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    effects: [
      { kind: 'targeting', target: 'one-creature', targetType: 'creature' },
      {
        kind: 'note',
        text: 'The target regains 2d8 + your spellcasting ability modifier Hit Points. Dice-based healing with ability modifier is under-modeled.',
      },
    ],
    scaling: [{
      category: 'extra-healing',
      description: 'The healing increases by 2d8 for each spell slot level above 1.',
      mode: 'per-slot-level',
      startsAtSlotLevel: 1,
      amount: '2d8',
    }],
    description: {
      full: 'A creature you touch regains a number of Hit Points equal to 2d8 plus your spellcasting ability modifier. Using a Higher-Level Spell Slot. The healing increases by 2d8 for each spell slot level above 1.',
      summary: 'Touch a creature to restore 2d8 + spellcasting modifier HP.',
    },
  },
  {
    id: 'healing-word',
    name: 'Healing Word',
    school: 'abjuration',
    level: 1,
    classes: ['bard', 'cleric', 'druid'],
    castingTime: { normal: { value: 1, unit: 'bonus-action' } },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true },
    effects: [
      { kind: 'targeting', target: 'one-creature', targetType: 'creature', requiresSight: true },
      {
        kind: 'note',
        text: 'The target regains 2d4 + your spellcasting ability modifier Hit Points. Dice-based healing with ability modifier is under-modeled.',
      },
    ],
    scaling: [{
      category: 'extra-healing',
      description: 'The healing increases by 2d4 for each spell slot level above 1.',
      mode: 'per-slot-level',
      startsAtSlotLevel: 1,
      amount: '2d4',
    }],
    description: {
      full: 'A creature of your choice that you can see within range regains Hit Points equal to 2d4 plus your spellcasting ability modifier. Using a Higher-Level Spell Slot. The healing increases by 2d4 for each spell slot level above 1.',
      summary: 'A creature you can see within 60 feet regains 2d4 + spellcasting modifier HP.',
    },
  },
  {
    id: 'thunderwave',
    name: 'Thunderwave',
    school: 'evocation',
    level: 1,
    classes: ['bard', 'druid', 'sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'detect-magic',
    name: 'Detect Magic',
    school: 'divination',
    level: 1,
    classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'guiding-bolt',
    name: 'Guiding Bolt',
    school: 'evocation',
    level: 1,
    classes: ['cleric'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'sleep',
    name: 'Sleep',
    school: 'enchantment',
    level: 1,
    classes: ['bard', 'sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'charm-person',
    name: 'Charm Person',
    school: 'enchantment',
    level: 1,
    classes: ['bard', 'druid', 'sorcerer', 'warlock', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 1, unit: 'hour' },
    components: { verbal: true, somatic: true },
    effects: [
      { kind: 'targeting', target: 'one-creature', targetType: 'creature' },
      {
        kind: 'save',
        save: { ability: 'wis' },
        onFail: [
          { kind: 'condition', conditionId: 'charmed' },
        ],
        text: 'The target has Advantage on this save if you or your allies are fighting it.',
      },
      {
        kind: 'note',
        text: 'The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you. The spell ends early if you or your allies damage the target.',
      },
    ],
    scaling: [{
      category: 'extra-targets',
      description: 'You can target one additional creature for each spell slot level above 1.',
      mode: 'per-slot-level',
      startsAtSlotLevel: 1,
    }],
    description: {
      full: 'One Humanoid you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1.',
      summary: 'A humanoid makes a Wisdom save or is Charmed for 1 hour; Friendly to you while Charmed.',
    },
  },
  {
    id: 'protection-from-evil',
    name: 'Protection from Evil and Good',
    school: 'abjuration',
    level: 1,
    classes: ['cleric', 'druid', 'paladin', 'warlock', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'touch' },
    duration: { kind: 'timed', value: 10, unit: 'minute', concentration: true },
    components: { verbal: true, somatic: true, material: { description: 'a flask of Holy Water', cost: { value: 25, unit: 'gp', atLeast: true }, consumed: true } },
    effects: [
      { kind: 'targeting', target: 'one-creature', targetType: 'creature' },
      {
        kind: 'roll-modifier',
        appliesTo: 'attack-rolls',
        modifier: 'disadvantage',
        condition: EXTRAPLANAR_CREATURE_TYPES,
      },
      {
        kind: 'grant',
        grantType: 'condition-immunity',
        value: 'charmed',
        condition: EXTRAPLANAR_CREATURE_TYPES,
        text: 'Also immune to possession from these creature types.',
      },
      {
        kind: 'grant',
        grantType: 'condition-immunity',
        value: 'frightened',
        condition: EXTRAPLANAR_CREATURE_TYPES,
      },
      {
        kind: 'note',
        text: 'If the target is already possessed, Charmed, or Frightened by such a creature, the target has Advantage on any new saving throw against the relevant effect.',
      },
    ],
    description: {
      full: 'Until the spell ends, one willing creature you touch is protected against creatures that are Aberrations, Celestials, Elementals, Fey, Fiends, or Undead. The protection grants several benefits. Creatures of those types have Disadvantage on attack rolls against the target. The target also can\'t be possessed by or gain the Charmed or Frightened conditions from them. If the target is already possessed, Charmed, or Frightened by such a creature, the target has Advantage on any new saving throw against the relevant effect.',
      summary: 'Touch a willing creature to protect it against Aberrations, Celestials, Elementals, Fey, Fiends, and Undead for up to 10 minutes.',
    },
  },
  {
    id: 'bless',
    name: 'Bless',
    school: 'enchantment',
    level: 1,
    classes: ['cleric', 'paladin'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'feather-fall',
    name: 'Feather Fall',
    school: 'transmutation',
    level: 1,
    classes: ['bard', 'sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'identify',
    name: 'Identify',
    school: 'divination',
    level: 1,
    classes: ['bard', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'alarm',
    name: 'Alarm',
    school: 'abjuration',
    level: 1,
    classes: ['ranger', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'minute' }, alternate: [{ value: 1, unit: 'minute', ritual: true }] },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 8, unit: 'hour' },
    components: { verbal: true, somatic: true, material: { description: 'a bell and silver wire' } },
    effects: [{ kind: 'note', text: 'Wards door, window, or 20-foot cube. Alerts when touched. Audible or mental alarm.' }],
    description: {
      full: "You set an alarm against intrusion. Choose a door, a window, or an area within range that is no larger than a 20-foot Cube. Until the spell ends, an alarm alerts you whenever a creature touches or enters the warded area. When you cast the spell, you can designate creatures that won't set off the alarm. You also choose whether the alarm is audible or mental: Audible Alarm. The alarm produces the sound of a handbell for 10 seconds within 60 feet of the warded area. Mental Alarm. You are alerted by a mental ping if you are within 1 mile of the warded area. This ping awakens you if you're asleep.",
      summary: 'Wards an area; alerts when creatures touch or enter. Audible or mental alarm.',
    },
  },
  {
    id: 'animal-friendship',
    name: 'Animal Friendship',
    school: 'enchantment',
    level: 1,
    classes: ['bard', 'druid', 'ranger'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 24, unit: 'hour' },
    components: { verbal: true, somatic: true, material: { description: 'a morsel of food' } },
    effects: [{ kind: 'note', text: 'Beast makes Wis save or is Charmed for 24 hours. Ends if you or allies damage it.' }],
    description: {
      full: "Target a Beast that you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. If you or one of your allies deals damage to the target, the spells ends. Using a Higher-Level Spell Slot. You can target one additional Beast for each spell slot level above 1.",
      summary: 'Beast makes Wis save or is Charmed for 24 hours. Scales with extra targets.',
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // 2nd Level
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'acid-arrow',
    name: 'Acid Arrow',
    school: 'evocation',
    level: 2,
    classes: ['wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 90, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true, material: { description: 'powdered rhubarb leaf' } },
    effects: [{ kind: 'note', text: 'Ranged spell attack: 4d4 acid on hit + 2d4 at end of target next turn. Miss: half initial only.' }],
    description: {
      full: "A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only. Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2.",
      summary: 'Ranged spell attack dealing 4d4 acid plus 2d4 at end of target turn. Scales with slot level.',
    },
  },
  {
    id: 'aid',
    name: 'Aid',
    school: 'abjuration',
    level: 2,
    classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 8, unit: 'hour' },
    components: { verbal: true, somatic: true, material: { description: 'a strip of white cloth' } },
    effects: [{ kind: 'note', text: 'Up to 3 creatures: HP max and current increase by 5. +5 per slot level above 2.' }],
    description: {
      full: "Choose up to three creatures within range. Each target's Hit Point maximum and current Hit Points increase by 5 for the duration. Using a Higher-Level Spell Slot. Each target's Hit Points increase by 5 for each spell slot level above 2.",
      summary: 'Up to three creatures gain +5 HP max and current for 8 hours. Scales with slot level.',
    },
  },
  {
    id: 'alter-self',
    name: 'Alter Self',
    school: 'transmutation',
    level: 2,
    classes: ['sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'self' },
    duration: { kind: 'timed', value: 1, unit: 'hour', concentration: true, upTo: true },
    components: { verbal: true, somatic: true },
    effects: [{ kind: 'note', text: 'Aquatic Adaptation, Change Appearance, or Natural Weapons. Magic action to switch option.' }],
    description: {
      full: "You alter your physical form. Choose one of the following options. Its effects last for the duration, during which you can take a Magic action to replace the option you chose with a different one. Aquatic Adaptation. You sprout gills and grow webs between your fingers. You can breathe underwater and gain a Swim Speed equal to your Speed. Change Appearance. You alter your appearance. You decide what you look like, including your height, weight, facial features, sound of your voice, hair length, coloration, and other distinguishing characteristics. You can make yourself appear as a member of another species, though none of your statistics change. You can't appear as a creature of a different size, and your basic shape stays the same; if you're bipedal, you can't use this spell to become quadrupedal, for instance. For the duration, you can take a Magic action to change your appearance in this way again. Natural Weapons. You grow claws (Slashing), fangs (Piercing), horns (Piercing), or hooves (Bludgeoning). When you use your Unarmed Strike to deal damage with that new growth, it deals 1d6 damage of the type in parentheses instead of dealing the normal damage for your Unarmed Strike, and you use your spellcasting ability modifier for the attack and damage rolls rather than using Strength.",
      summary: 'Transform with Aquatic Adaptation, Change Appearance, or Natural Weapons. Switch with Magic action.',
    },
  },
  {
    id: 'animal-messenger',
    name: 'Animal Messenger',
    school: 'enchantment',
    level: 2,
    classes: ['bard', 'druid', 'ranger'],
    castingTime: { normal: { value: 1, unit: 'action' }, alternate: [{ value: 1, unit: 'action', ritual: true }] },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 24, unit: 'hour' },
    components: { verbal: true, somatic: true, material: { description: 'a morsel of food' } },
    effects: [{ kind: 'note', text: 'Tiny beast delivers 25-word message to location/recipient. +48 hours per slot above 2.' }],
    description: {
      full: "A Tiny Beast of your choice that you can see within range must succeed on a Charisma saving throw, or it attempts to deliver a message for you (if the target's Challenge Rating isn't 0, it automatically succeeds). You specify a location you have visited and a recipient who matches a general description, such as \"a person dressed in the uniform of the town guard\" or \"a red-haired dwarf wearing a pointed hat.\" You also communicate a message of up to twenty-five words. The Beast travels for the duration toward the specified location, covering about 25 miles per 24 hours or 50 miles if the Beast can fly. When the Beast arrives, it delivers your message to the creature that you described, mimicking your communication. If the Beast doesn't reach its destination before the spell ends, the message is lost, and the Beast returns to where you cast the spell. Using a Higher-Level Spell Slot. The spell's duration increases by 48 hours for each spell slot level above 2.",
      summary: 'Tiny beast delivers 25-word message to described recipient. Duration scales with slot level.',
    },
  },
  {
    id: 'arcane-lock',
    name: 'Arcane Lock',
    school: 'abjuration',
    level: 2,
    classes: ['wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'touch' },
    duration: { kind: 'until-dispelled' },
    components: { verbal: true, somatic: true, material: { description: 'gold dust worth 25+ GP', cost: { value: 25, unit: 'gp', atLeast: true }, consumed: true } },
    effects: [{ kind: 'note', text: 'Magically lock door/window/gate/container. Designate who can open; optional password.' }],
    description: {
      full: "You touch a closed door, window, gate, container, or hatch and magically lock it for the duration. This lock can't be unlocked by any nonmagical means. You and any creatures you designate when you cast the spell can open and close the object despite the lock. You can also set a password that, when spoken within 5 feet of the object, unlocks it for 1 minute.",
      summary: 'Magically lock object until dispelled. Designate who can open; optional password.',
    },
  },
  {
    id: 'arcanists-magic-aura',
    name: "Arcanist's Magic Aura",
    school: 'illusion',
    level: 2,
    classes: ['wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'touch' },
    duration: { kind: 'timed', value: 24, unit: 'hour' },
    components: { verbal: true, somatic: true, material: { description: 'a small square of silk' } },
    effects: [{ kind: 'note', text: 'Creature: Mask (appear as different creature type). Object: False Aura for detection spells.' }],
    description: {
      full: "With a touch, you place an illusion on a willing creature or an object that isn't being worn or carried. A creature gains the Mask effect below, and an object gains the False Aura effect below. The effect lasts for the duration. If you cast the spell on the same target every day for 30 days, the illusion lasts until dispelled. Mask (Creature). Choose a creature type other than the target's actual type. Spells and other magical effects treat the target as if it were a creature of the chosen type. False Aura (Object). You change the way the target appears to spells and magical effects that detect magical auras, such as Detect Magic. You can make a nonmagical object appear magical, make a magic item appear nonmagical, or change the object's aura so that it appears to belong to a school of magic you choose.",
      summary: 'Creature: Mask as different type. Object: alter or falsify magical aura for detection.',
    },
  },
  {
    id: 'augury',
    name: 'Augury',
    school: 'divination',
    level: 2,
    classes: ['cleric', 'druid', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'minute' }, alternate: [{ value: 1, unit: 'minute', ritual: true }] },
    range: { kind: 'self' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true, material: { description: 'specially marked sticks, bones, cards, or other divinatory tokens worth 25+ GP', cost: { value: 25, unit: 'gp', atLeast: true } } },
    effects: [{ kind: 'note', text: 'Omen about results of planned action within 30 minutes. Weal, woe, both, or indifference.' }],
    description: {
      full: "You receive an omen from an otherworldly entity about the results of a course of action that you plan to take within the next 30 minutes. The GM chooses the omen from the Omens table. The spell doesn't account for circumstances, such as other spells, that might change the results. If you cast the spell more than once before finishing a Long Rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer.",
      summary: 'Receive omen about planned action within 30 minutes. Cumulative 25% no-answer on repeat casts.',
    },
  },
  {
    id: 'misty-step',
    name: 'Misty Step',
    school: 'conjuration',
    level: 2,
    classes: ['sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'spiritual-weapon',
    name: 'Spiritual Weapon',
    school: 'evocation',
    level: 2,
    classes: ['cleric'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'hold-person',
    name: 'Hold Person',
    school: 'enchantment',
    level: 2,
    classes: ['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'timed', value: 1, unit: 'minute', concentration: true, upTo: true },
    components: { verbal: true, somatic: true, material: { description: 'a straight piece of iron' } },
    effects: [
      {
        kind: 'targeting',
        target: 'one-creature',
        targetType: 'creature',
        requiresSight: true,
        condition: { kind: 'creature-type', target: 'target', creatureTypes: ['humanoid'] },
      },
      {
        kind: 'save',
        save: { ability: 'wis' },
        onFail: [{ kind: 'condition', conditionId: 'paralyzed' }],
      },
      {
        kind: 'note',
        text: 'At the end of each of its turns, the target repeats the save, ending the spell on itself on a success.',
      },
    ],
    scaling: [{
      category: 'extra-targets',
      description: 'You can target one additional Humanoid for each spell slot level above 2.',
      mode: 'per-slot-level',
      startsAtSlotLevel: 2,
    }],
    description: {
      full: 'Choose a Humanoid that you can see within range. The target must succeed on a Wisdom saving throw or have the Paralyzed condition for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success. Using a Higher-Level Spell Slot. You can target one additional Humanoid for each spell slot level above 2.',
      summary: 'A humanoid you can see makes a Wisdom save or is Paralyzed; repeats save at end of each turn.',
    },
  },
  {
    id: 'scorching-ray',
    name: 'Scorching Ray',
    school: 'evocation',
    level: 2,
    classes: ['sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 120, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true },
    deliveryMethod: 'ranged-spell-attack',
    effects: [
      {
        kind: 'targeting',
        target: 'chosen-creatures',
        targetType: 'creature',
        canSelectSameTargetMultipleTimes: true,
      },
      {
        kind: 'damage',
        damage: '2d6',
        damageType: 'fire',
        instances: { count: 3, canSplitTargets: true, canStackOnSingleTarget: true },
      },
      {
        kind: 'note',
        text: 'Each ray requires a separate ranged spell attack roll.',
      },
    ],
    scaling: [{
      category: 'extra-damage',
      description: 'You create one additional ray for each spell slot level above 2.',
      mode: 'per-slot-level',
      startsAtSlotLevel: 2,
    }],
    description: {
      full: 'You hurl three fiery rays. You can hurl them at one target within range or at several. Make a ranged spell attack for each ray. On a hit, the target takes 2d6 Fire damage. Using a Higher-Level Spell Slot. You create one additional ray for each spell slot level above 2.',
      summary: 'Three ranged spell attacks dealing 2d6 fire damage each; rays can be split among targets.',
    },
  },
  {
    id: 'web',
    name: 'Web',
    school: 'conjuration',
    level: 2,
    classes: ['sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'timed', value: 1, unit: 'hour', concentration: true, upTo: true },
    components: { verbal: true, somatic: true, material: { description: 'a bit of spiderweb' } },
    effects: [
      {
        kind: 'targeting',
        target: 'creatures-in-area',
        area: { kind: 'cube', size: 20 },
      },
      {
        kind: 'save',
        save: { ability: 'dex' },
        onFail: [{ kind: 'condition', conditionId: 'restrained' }],
        text: 'First time a creature enters the webs on a turn or starts its turn there.',
      },
      {
        kind: 'check',
        actor: 'nearby-creature',
        actionRequired: true,
        check: { ability: 'str', skill: 'athletics', dc: 0 },
        onSuccess: [{ kind: 'note', text: 'The creature is no longer Restrained.' }],
        text: 'DC equals your spell save DC. A creature Restrained by the webs can take an action to attempt this check.',
      },
      {
        kind: 'note',
        text: 'The webs are Difficult Terrain and the area is Lightly Obscured. If not anchored between two solid masses or layered across a surface, the web collapses and the spell ends at the start of your next turn. The webs are flammable; any 5-foot Cube exposed to fire burns away in 1 round, dealing 2d4 Fire damage to any creature that starts its turn in the fire.',
      },
    ],
    description: {
      full: "You conjure a mass of sticky webbing at a point within range. The webs fill a 20-foot Cube there for the duration. The webs are Difficult Terrain, and the area within them is Lightly Obscured. If the webs aren't anchored between two solid masses (such as walls or trees) or layered across a floor, wall, or ceiling, the web collapses on itself, and the spell ends at the start of your next turn. Webs layered over a flat surface have a depth of 5 feet. The first time a creature enters the webs on a turn or starts its turn there, it must succeed on a Dexterity saving throw or have the Restrained condition while in the webs or until it breaks free. A creature Restrained by the webs can take an action to make a Strength (Athletics) check against your spell save DC. If it succeeds, it is no longer Restrained. The webs are flammable. Any 5-foot Cube of webs exposed to fire burns away in 1 round, dealing 2d4 Fire damage to any creature that starts its turn in the fire.",
      summary: '20-foot cube of webs; creatures entering or starting a turn make a Dex save or are Restrained. Flammable.',
    },
  },
  {
    id: 'invisibility',
    name: 'Invisibility',
    school: 'illusion',
    level: 2,
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'touch' },
    duration: { kind: 'timed', value: 1, unit: 'hour', concentration: true, upTo: true },
    components: { verbal: true, somatic: true, material: { description: 'an eyelash in gum arabic' } },
    effects: [
      { kind: 'targeting', target: 'one-creature', targetType: 'creature' },
      { kind: 'condition', conditionId: 'invisible' },
      {
        kind: 'note',
        text: 'The spell ends early immediately after the target makes an attack roll, deals damage, or casts a spell.',
      },
    ],
    scaling: [{
      category: 'extra-targets',
      description: 'You can target one additional creature for each spell slot level above 2.',
      mode: 'per-slot-level',
      startsAtSlotLevel: 2,
    }],
    description: {
      full: 'A creature you touch has the Invisible condition until the spell ends. The spell ends early immediately after the target makes an attack roll, deals damage, or casts a spell. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2.',
      summary: 'A creature you touch becomes Invisible for up to 1 hour; ends if the target attacks, deals damage, or casts a spell.',
    },
  },
  {
    id: 'silence',
    name: 'Silence',
    school: 'illusion',
    level: 2,
    classes: ['bard', 'cleric', 'ranger'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'lesser-restoration',
    name: 'Lesser Restoration',
    school: 'abjuration',
    level: 2,
    classes: ['bard', 'cleric', 'druid', 'paladin', 'ranger'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'fireball',
    name: 'Fireball',
    school: 'evocation',
    level: 3,
    classes: ['sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 150, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true, material: { description: 'a ball of bat guano and sulfur' } },
    effects: [
      {
        kind: 'targeting',
        target: 'creatures-in-area',
        targetType: 'creature',
        rangeFeet: 150,
        area: {
          kind: 'sphere',
          size: 20,
        },
      },
      {
        kind: 'save',
        save: { ability: 'dex' },
        onFail: [{ kind: 'damage', damage: '8d6', damageType: 'fire' }],
        onSuccess: [{ kind: 'damage', damage: '4d6', damageType: 'fire' }],
      },
      {
        kind: 'note',
        text: "Flammable objects in the area that aren't being worn or carried start burning.",
      },
    ],
    scaling: [{ category: 'extra-damage', description: 'Damage increases by 1d6 for each slot level above 3rd.', mode: 'per-slot-level', startsAtSlotLevel: 3, amount: '1d6' }],
    description: {
      full: "A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the area that aren't being worn or carried start burning.",
      summary: '20-foot-radius fire explosion dealing 8d6 fire damage; Dexterity save for half.',
    },
  },
  {
    id: 'counterspell',
    name: 'Counterspell',
    school: 'abjuration',
    level: 3,
    classes: ['sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'spirit-guardians',
    name: 'Spirit Guardians',
    school: 'conjuration',
    level: 3,
    classes: ['cleric'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'animate-dead',
    name: 'Animate Dead',
    school: 'necromancy',
    level: 3,
    classes: ['cleric', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'minute' } },
    range: { kind: 'distance', value: { value: 10, unit: 'ft' } },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true, material: { description: 'a drop of blood, a piece of flesh, and a pinch of bone dust' } },
    effects: [{ kind: 'note', text: 'Bones/corpse become Skeleton/Zombie. Control 24h; re-cast to maintain. +2 undead per slot above 3.' }],
    description: {
      full: "Choose a pile of bones or a corpse of a Medium or Small Humanoid within range. The target becomes an Undead creature: a Skeleton if you chose bones or a Zombie if you chose a corpse. On each of your turns, you can take a Bonus Action to mentally command any creature you made with this spell if the creature is within 60 feet of you. The creature is under your control for 24 hours, after which it stops obeying any command you've given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature again before the current 24-hour period ends. This use of the spell reasserts your control over up to four creatures you have animated with this spell rather than animating a new creature. Using a Higher-Level Spell Slot. You animate or reassert control over two additional Undead creatures for each spell slot level above 3.",
      summary: 'Create Skeleton or Zombie from bones/corpse. Control 24h; re-cast to maintain. Scales with extra undead.',
    },
  },
  {
    id: 'revivify',
    name: 'Revivify',
    school: 'necromancy',
    level: 3,
    classes: ['cleric', 'paladin'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'haste',
    name: 'Haste',
    school: 'transmutation',
    level: 3,
    classes: ['sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'lightning-bolt',
    name: 'Lightning Bolt',
    school: 'evocation',
    level: 3,
    classes: ['sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'fly',
    name: 'Fly',
    school: 'transmutation',
    level: 3,
    classes: ['sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'dispel-magic',
    name: 'Dispel Magic',
    school: 'abjuration',
    level: 3,
    classes: ['bard', 'cleric', 'druid', 'paladin', 'sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'remove-curse',
    name: 'Remove Curse',
    school: 'abjuration',
    level: 3,
    classes: ['cleric', 'paladin', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'slow',
    name: 'Slow',
    school: 'transmutation',
    level: 3,
    classes: ['sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // 4th Level
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'arcane-eye',
    name: 'Arcane Eye',
    school: 'divination',
    level: 4,
    classes: ['wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 1, unit: 'hour', concentration: true, upTo: true },
    components: { verbal: true, somatic: true, material: { description: 'a bit of bat fur' } },
    effects: [{ kind: 'note', text: 'Invisible invulnerable eye; see in all directions, 30ft darkvision. Bonus action to move 30ft.' }],
    description: {
      full: "You create an Invisible, invulnerable eye within range that hovers for the duration. You mentally receive visual information from the eye, which can see in every direction. It also has Darkvision with a range of 30 feet. As a Bonus Action, you can move the eye up to 30 feet in any direction. A solid barrier blocks the eye's movement, but the eye can pass through an opening as small as 1 inch in diameter.",
      summary: 'Invisible eye relays vision; 30ft darkvision. Bonus action to move 30ft.',
    },
  },
  {
    id: 'aura-of-life',
    name: 'Aura of Life',
    school: 'abjuration',
    level: 4,
    classes: ['cleric', 'paladin'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'self' },
    duration: { kind: 'timed', value: 10, unit: 'minute', concentration: true, upTo: true },
    components: { verbal: true },
    effects: [{ kind: 'note', text: '30ft aura: Resistance to Necrotic, HP max cannot be reduced. Ally at 0 HP regains 1 HP at start of turn.' }],
    description: {
      full: "An aura radiates from you in a 30-foot Emanation for the duration. While in the aura, you and your allies have Resistance to Necrotic damage, and your Hit Point maximums can't be reduced. If an ally with 0 Hit Points starts its turn in the aura, that ally regains 1 Hit Point.",
      summary: '30ft aura: Necrotic resistance, HP max protection, 0 HP allies regain 1 HP at turn start.',
    },
  },
  {
    id: 'dimension-door',
    name: 'Dimension Door',
    school: 'conjuration',
    level: 4,
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'banishment',
    name: 'Banishment',
    school: 'abjuration',
    level: 4,
    classes: ['cleric', 'paladin', 'sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'polymorph',
    name: 'Polymorph',
    school: 'transmutation',
    level: 4,
    classes: ['bard', 'druid', 'sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'ice-storm',
    name: 'Ice Storm',
    school: 'evocation',
    level: 4,
    classes: ['druid', 'sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'fire-shield',
    name: 'Fire Shield',
    school: 'evocation',
    level: 4,
    classes: ['druid', 'sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'self' },
    duration: { kind: 'timed', value: 10, unit: 'minute' },
    components: { verbal: true, somatic: true, material: { description: 'a bit of phosphorus or a firefly' } },
    effects: [
      {
        kind: 'note',
        text: 'Choose warm shield (Resistance to Cold, retaliatory 2d8 Fire) or chill shield (Resistance to Fire, retaliatory 2d8 Cold). Shield variant selection is under-modeled.',
      },
      {
        kind: 'trigger',
        trigger: 'hit',
        effects: [{ kind: 'damage', damage: '2d8' }],
        text: 'When a creature within 5 feet hits you with a melee attack roll. Damage type is Fire (warm) or Cold (chill) depending on shield choice.',
      },
    ],
    description: {
      full: 'Wispy flames wreathe your body for the duration, shedding Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you Resistance to Cold damage, and the chill shield grants you Resistance to Fire damage. In addition, whenever a creature within 5 feet of you hits you with a melee attack roll, the shield erupts with flame. The attacker takes 2d8 Fire damage from a warm shield or 2d8 Cold damage from a chill shield.',
      summary: 'Flames wreathe you for 10 minutes, granting damage resistance and dealing 2d8 retaliatory damage when hit in melee.',
    },
  },
  {
    id: 'animate-objects',
    name: 'Animate Objects',
    school: 'transmutation',
    level: 5,
    classes: ['bard', 'sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 120, unit: 'ft' } },
    duration: { kind: 'timed', value: 1, unit: 'minute', concentration: true, upTo: true },
    components: { verbal: true, somatic: true },
    effects: [{ kind: 'note', text: 'Animate objects up to spellcasting mod count (M=1, L=2, H=3). Constructs under your control. Slam damage scales with slot.' }],
    description: {
      full: "Objects animate at your command. Choose a number of nonmagical objects within range that aren't being worn or carried, aren't fixed to a surface, and aren't Gargantuan. The maximum number of objects is equal to your spellcasting ability modifier; for this number, a Medium or smaller target counts as one object, a Large target counts as two, and a Huge target counts as three. Each target animates, sprouts legs, and becomes a Construct that uses the Animated Object stat block; this creature is under your control until the spell ends or until it is reduced to 0 Hit Points. Using a Higher-Level Spell Slot. The creature's Slam damage increases by 1d4 (Medium or smaller), 1d6 (Large), or 1d12 (Huge) for each spell slot level above 5.",
      summary: 'Animate objects as Constructs under your control. Count and damage scale with slot level.',
    },
  },
  {
    id: 'antilife-shell',
    name: 'Antilife Shell',
    school: 'abjuration',
    level: 5,
    classes: ['druid'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'self' },
    duration: { kind: 'timed', value: 1, unit: 'hour', concentration: true, upTo: true },
    components: { verbal: true, somatic: true },
    effects: [{ kind: 'note', text: '10ft aura blocks non-Construct/Undead from passing. Can cast spells and use ranged/reach through.' }],
    description: {
      full: "An aura extends from you in a 10-foot Emanation for the duration. The aura prevents creatures other than Constructs and Undead from passing or reaching through it. An affected creature can cast spells or make attacks with Ranged or Reach weapons through the barrier. If you move so that an affected creature is forced to pass through the barrier, the spell ends.",
      summary: '10ft aura blocks living creatures from passing. Ranged attacks and spells can pass through.',
    },
  },
  {
    id: 'arcane-hand',
    name: 'Arcane Hand',
    school: 'evocation',
    level: 5,
    classes: ['sorcerer', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 120, unit: 'ft' } },
    duration: { kind: 'timed', value: 1, unit: 'minute', concentration: true, upTo: true },
    components: { verbal: true, somatic: true, material: { description: 'an eggshell and a glove' } },
    effects: [{ kind: 'note', text: 'Large hand: Clenched Fist (5d8 Force), Forceful Hand (push), Grasping Hand (grapple+crush), Interposing Hand (cover).' }],
    description: {
      full: "You create a Large hand of shimmering magical energy in an unoccupied space that you can see within range. The hand lasts for the duration, and it moves at your command, mimicking the movements of your own hand. The hand is an object that has AC 20 and Hit Points equal to your Hit Point maximum. When you cast the spell and as a Bonus Action on your later turns, you can move the hand up to 60 feet and then cause one of the following effects: Clenched Fist (5d8 Force), Forceful Hand (push), Grasping Hand (grapple and crush), Interposing Hand (half cover). Using a Higher-Level Spell Slot. The damage of the Clenched Fist increases by 2d8 and the damage of the Grasping Hand increases by 2d6 for each spell slot level above 5.",
      summary: 'Large magical hand with multiple modes: attack, push, grapple, or cover. Damage scales with slot.',
    },
  },
  {
    id: 'awaken',
    name: 'Awaken',
    school: 'transmutation',
    level: 5,
    classes: ['bard', 'druid'],
    castingTime: { normal: { value: 8, unit: 'hour' } },
    range: { kind: 'touch' },
    duration: { kind: 'instantaneous' },
    components: { verbal: true, somatic: true, material: { description: 'an agate worth 1,000+ GP', cost: { value: 1000, unit: 'gp', atLeast: true }, consumed: true } },
    effects: [{ kind: 'note', text: 'Beast or Plant with Int 3 or less gains Int 10, language, 30-day charmed service.' }],
    description: {
      full: "You spend the casting time tracing magical pathways within a precious gemstone, and then touch the target. The target must be either a Beast or Plant creature with an Intelligence of 3 or less or a natural plant that isn't a creature. The target gains language you know. If the target is a natural plant, it becomes a Plant creature and gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human’s. The GM chooses statistics appropriate for the awakened Plant, such as the statistics for the Awakened Shrub or Awakened Tree in 'Monsters.' The awakened target has the Charmed condition for 30 days or until you or your allies deal damage to it. When that condition ends, the awakened creature chooses its attitude toward you.",
      summary: 'Beast or Plant gains Intelligence 10, speech, and is Charmed by you for 30 days.',
    },
  },
  {
    id: 'wall-of-force',
    name: 'Wall of Force',
    school: 'evocation',
    level: 5,
    classes: ['wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'greater-restoration',
    name: 'Greater Restoration',
    school: 'abjuration',
    level: 5,
    classes: ['bard', 'cleric', 'druid'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'raise-dead',
    name: 'Raise Dead',
    school: 'necromancy',
    level: 5,
    classes: ['bard', 'cleric', 'paladin'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'chain-lightning',
    name: 'Chain Lightning',
    school: 'evocation',
    level: 6,
    classes: ['sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'disintegrate',
    name: 'Disintegrate',
    school: 'transmutation',
    level: 6,
    classes: ['sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'arcane-sword',
    name: 'Arcane Sword',
    school: 'evocation',
    level: 7,
    classes: ['bard', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 90, unit: 'ft' } },
    duration: { kind: 'timed', value: 1, unit: 'minute', concentration: true, upTo: true },
    components: { verbal: true, somatic: true, material: { description: 'a miniature sword worth 250+ GP', cost: { value: 250, unit: 'gp', atLeast: true } } },
    effects: [{ kind: 'note', text: 'Spectral sword: melee spell attack 4d12+mod Force. Bonus action to move 30ft and repeat attack.' }],
    description: {
      full: "You create a spectral sword that hovers within range. It lasts for the duration. When the sword appears, you make a melee spell attack against a target within 5 feet of the sword. On a hit, the target takes Force damage equal to 4d12 plus your spellcasting ability modifier. On your later turns, you can take a Bonus Action to move the sword up to 30 feet to a spot you can see and repeat the attack against the same target or a different one.",
      summary: 'Spectral sword makes melee spell attacks for 4d12+mod Force. Bonus action to move and attack.',
    },
  },
  {
    id: 'teleport',
    name: 'Teleport',
    school: 'conjuration',
    level: 7,
    classes: ['bard', 'sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'resurrection',
    name: 'Resurrection',
    school: 'necromancy',
    level: 7,
    classes: ['bard', 'cleric'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'animal-shapes',
    name: 'Animal Shapes',
    school: 'transmutation',
    level: 8,
    classes: ['druid'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
    duration: { kind: 'timed', value: 24, unit: 'hour' },
    components: { verbal: true, somatic: true },
    effects: [{ kind: 'note', text: 'Willing creatures become Large or smaller Beast CR 4 or lower. Magic action to retransform.' }],
    description: {
      full: "Choose any number of willing creatures that you can see within range. Each target shape-shifts into a Large or smaller Beast of your choice that has a Challenge Rating of 4 or lower. You can choose a different form for each target. On later turns, you can take a Magic action to transform the targets again. A target's game statistics are replaced by the chosen Beast's statistics, but the target retains its creature type; Hit Points; Hit Point Dice; alignment; ability to communicate; and Intelligence, Wisdom, and Charisma scores. The target gains Temporary Hit Points equal to the first form's HP.",
      summary: 'Transform willing creatures into Beasts (CR 4 or lower). Magic action to change forms.',
    },
  },
  {
    id: 'antimagic-field',
    name: 'Antimagic Field',
    school: 'abjuration',
    level: 8,
    classes: ['cleric', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'action' } },
    range: { kind: 'self' },
    duration: { kind: 'timed', value: 1, unit: 'hour', concentration: true, upTo: true },
    components: { verbal: true, somatic: true, material: { description: 'iron filings' } },
    effects: [{ kind: 'note', text: '10ft aura: no spells, magic actions, or magic item properties. Suppresses ongoing spells.' }],
    description: {
      full: "An aura of antimagic surrounds you in 10-foot Emanation. No one can cast spells, take Magic actions, or create other magical effects inside the aura, and those things can't target or otherwise affect anything inside it. Magical properties of magic items don't work inside the aura or on anything inside it. Areas of effect created by spells or other magic can't extend into the aura, and no one can teleport into or out of it or use planar travel there. Ongoing spells, except those cast by an Artifact or a deity, are suppressed in the area.",
      summary: '10ft aura suppresses all magic. Spells and magic items do not function inside.',
    },
  },
  {
    id: 'antipathy-sympathy',
    name: 'Antipathy/Sympathy',
    school: 'enchantment',
    level: 8,
    classes: ['bard', 'druid', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'hour' } },
    range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
    duration: { kind: 'timed', value: 10, unit: 'day' },
    components: { verbal: true, somatic: true, material: { description: 'a mix of vinegar and honey' } },
    effects: [{ kind: 'note', text: 'Target creature/object: chosen creature kind makes Wis save within 120ft. Antipathy=Frightened, Sympathy=Charmed.' }],
    description: {
      full: "As you cast the spell, choose whether it creates antipathy or sympathy, and target one creature or object that is Huge or smaller. Then specify a kind of creature, such as red dragons, goblins, or vampires. A creature of the chosen kind makes a Wisdom saving throw when it comes within 120 feet of the target. Antipathy: The creature has the Frightened condition and must flee. Sympathy: The creature has the Charmed condition and must approach. If the Frightened or Charmed creature ends its turn more than 120 feet away, it can make a Wis save to end the effect.",
      summary: 'Target emanates antipathy (Frightened) or sympathy (Charmed) to chosen creature kind within 120ft.',
    },
  },
  {
    id: 'power-word-stun',
    name: 'Power Word Stun',
    school: 'enchantment',
    level: 8,
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'wish',
    name: 'Wish',
    school: 'conjuration',
    level: 9,
    classes: ['sorcerer', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
  {
    id: 'astral-projection',
    name: 'Astral Projection',
    school: 'necromancy',
    level: 9,
    classes: ['cleric', 'warlock', 'wizard'],
    castingTime: { normal: { value: 1, unit: 'hour' } },
    range: { kind: 'distance', value: { value: 10, unit: 'ft' } },
    duration: { kind: 'until-dispelled' },
    components: { verbal: true, somatic: true, material: { description: 'for each target: jacinth 1000+ GP and silver bar 100+ GP', cost: { value: 1100, unit: 'gp', atLeast: true }, consumed: true } },
    effects: [{ kind: 'note', text: 'You and up to 8 willing creatures project to Astral Plane. Bodies in suspended animation. Silver cord links forms.' }],
    description: {
      full: "You and up to eight willing creatures within range project your astral bodies into the Astral Plane. Each target's body is left behind in a state of suspended animation; it has the Unconscious condition, doesn't need food or air, and doesn't age. A target's astral form resembles its body in almost every way, replicating its game statistics and possessions. The principal difference is the addition of a silvery cord that trails from between the shoulder blades. If the cord is cut, the target's body and astral form both die. The moment an astral form leaves the Astral Plane, the target re-enters its body on the new plane. When the spell ends, the target reappears in its body and exits suspended animation.",
      summary: 'Project self and up to 8 creatures to Astral Plane. Bodies in suspended animation; silver cord links forms.',
    },
  },
  {
    id: 'power-word-kill',
    name: 'Power Word Kill',
    school: 'enchantment',
    level: 9,
    classes: ['bard', 'sorcerer', 'warlock', 'wizard'],
    effects: [{ kind: 'note', text: '' }],
    description: {
      full: '',
      summary: '',
    },
  },
];

function toSystemSpell(
  spell: SpellEntry,
  systemId: SystemRulesetId,
): Spell {
  return {
    ...spell,
    source: 'system',
    systemId,
    patched: false,
  } as Spell;
}

const SYSTEM_SPELLS_SRD_CC_V5_2_1: readonly Spell[] = SPELLS_RAW.map(
  (s) => toSystemSpell(s, DEFAULT_SYSTEM_RULESET_ID),
);

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const SYSTEM_SPELLS_BY_SYSTEM_ID: Record<SystemRulesetId, readonly Spell[]> = {
  [DEFAULT_SYSTEM_RULESET_ID]: SYSTEM_SPELLS_SRD_CC_V5_2_1,
};

export function getSystemSpells(systemId: SystemRulesetId): readonly Spell[] {
  return SYSTEM_SPELLS_BY_SYSTEM_ID[systemId] ?? [];
}

export function getSystemSpell(systemId: SystemRulesetId, id: string): Spell | undefined {
  return getSystemSpells(systemId).find((s) => s.id === id);
}
