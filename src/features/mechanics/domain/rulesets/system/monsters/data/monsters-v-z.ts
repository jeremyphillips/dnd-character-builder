import type { MonsterCatalogEntry } from '../types';

/** System catalog — ids starting with [v-z] (first character of `id`). */

export const MONSTERS_V_Z: readonly MonsterCatalogEntry[] = [
{
    id: "wolf",
    name: "Wolf",
    type: "beast",
    languages: [],
    sizeCategory: "medium",
    description: {
      short: "Pack hunters found throughout temperate and subarctic wilderness.",
      long: "Wolves are cunning and social predators that hunt in packs, using coordinated tactics to bring down prey larger than themselves.",
    },
    mechanics: {
      hitPoints: {
        count: 2,
        die: 8,
        modifier: +2,
      },
      armorClass: {
        kind: 'natural',
        offset: 1,
      },
      movement: { ground: 40 },
      actions: [
        {
          kind: 'natural',
          name: 'Bite',
          attackType: 'bite',
          damage: '2d4',
          damageBonus: 2,
          damageType: "piercing",
          attackBonus: 4,
          reach: 5,
          onHitEffects: [
            {
              kind: 'save',
              save: { ability: 'str', dc: 11 },
              onFail: [{ kind: 'condition', conditionId: 'prone' }],
            },
          ],
        },
      ],
      abilities: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 },
      traits: [
        {
          name: 'Pack Tactics',
          description:
            'The creature has Advantage on attack rolls against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn’t have the Incapacitated condition.',
          trigger: {
            kind: 'ally-near-target',
            withinFeet: 5,
            allyConditionNot: 'incapacitated',
          },
          effects: [
            {
              kind: 'roll-modifier',
              appliesTo: 'attack-rolls',
              modifier: 'advantage',
            },
          ],
        }
      ],
      proficiencyBonus: 2,
    },
    lore: {
      alignment: "n",
      challengeRating: 0.25,
      xpValue: 50,
      intelligence: "semi",
    },
  },
{
    id: "zombie",
    name: "Zombie",
    type: "undead",
    languages: [{ id: "common", speaks: false }],
    description: {
      short: "Shambling corpses animated by dark necromantic energy.",
      long: "Zombies are mindless undead created through necromantic magic. They are slow but relentless, obeying simple commands from their creator without hesitation or self-preservation.",
    },
    mechanics: {
      hitPoints: {
        count: 3,
        die: 8,
        modifier: +9,
      },
      armorClass: { kind: 'natural' },
      movement: { ground: 20 },
      actions: [{ kind: "natural", name: "Slam", attackType: "slam", reach: 5, damage: "1d8", attackBonus: 3, damageBonus: 1, damageType: "bludgeoning" }],
      traits: [
        {
          name: 'Undead Fortitude',
          description:
            'If damage reduces the zombie to 0 Hit Points, it makes a Constitution saving throw...',
          trigger: {
            kind: 'reduced-to-0-hp',
          },
          effects: [
            {
              kind: 'custom',
              id: 'monster.save_exception',
              params: {
                damageTypes: ['radiant'],
                criticalHit: true,
              },
            },
            {
              kind: 'save',
              save: {
                ability: 'con',
                dc: { kind: '5-plus-damage-taken' },
              },
              onFail: [],
              onSuccess: [
                { kind: 'note', text: 'Drops to 1 Hit Point instead.' },
              ],
            },
          ],
        }
      ],
      abilities: { str: 13, dex: 6, con: 16, int: 3, wis: 6, cha: 5 },
      proficiencyBonus: 2,
      immunities: ["poison", "exhaustion"],
    },
    lore: {
      alignment: "ne",
      challengeRating: 0.25,
      xpValue: 50,
      intelligence: "non",
    },
  },
{
    id: "young-red-dragon",
    name: "Young Red Dragon",
    type: "dragon",
    description: {
      short: "A fearsome young chromatic dragon wreathed in flame.",
      long: "Red dragons are the most covetous and arrogant of the chromatic dragons. Even in youth they are formidable predators, capable of unleashing devastating gouts of fire upon any who dare approach their growing hoards.",
    },
    mechanics: {
      hitPoints: {
        count: 17,
        die: 10,
        modifier: +85,
      },
      armorClass: {
        kind: 'natural',
        offset: 8,
      },
      movement: { ground: 40, climb: 40, fly: 80 },
      actions: [
        {
          kind: "special",
          name: "Multiattack",
          description: "The dragon makes three Rend attacks.",
          sequence: [
            {
              actionName: "Rend",
              count: 3
            }
          ]
        },
        {
          kind: "natural",
          name: "Rend",
          attackType: "claw",
          attackBonus: 10,
          reach: 10,
          damage: "2d6",
          damageBonus: 6, // remove? accounted for in str bonus
          damageType: "slashing",
          onHitEffects: [
            {
              kind: "damage",
              damage: "1d6",
              damageType: "fire"
            }
          ]
        },
        {
          kind: "special",
          name: "Fire Breath",
          description: "Dexterity Saving Throw: DC 17, each creature in a 30-foot cone.",
          save: { ability: "dex", dc: 17 },
          damage: "16d6",
          damageType: "fire",
          halfDamageOnSave: true,
          area: { kind: "cone", size: 30 },
          target: "creatures-in-area",
          recharge: { min: 5, max: 6 }
        }
      ],
      senses: {
        special: [
          { type: "darkvision", range: 120 },
          { type: "blindsight", range: 30 }
        ],
        passivePerception: 18,
      },
      proficiencies: {
        skills: { 
          perception: { proficiencyLevel: 2 },
          stealth: { proficiencyLevel: 1 }
        }
      },
      proficiencyBonus: 4,
      abilities: { str: 23, dex: 10, con: 17, int: 12, wis: 11, cha: 15 },
      savingThrows: {
        dex: { proficiencyLevel: 1 },
        wis: { proficiencyLevel: 1 },
      },
      immunities: ["fire"],
    },
    lore: {
      alignment: "ce",
      challengeRating: 10,
      xpValue: 5900,
      intelligence: "average",
    },
  }
];
