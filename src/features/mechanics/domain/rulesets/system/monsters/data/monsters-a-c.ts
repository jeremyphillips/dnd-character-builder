import type { MonsterCatalogEntry } from '../types';

/** System catalog — ids starting with [a-c] (first character of `id`). */

export const MONSTERS_A_C: readonly MonsterCatalogEntry[] = [
{
    id: "bugbear-warrior",
    name: "Bugbear Warrior",
    type: "fey",
    sizeCategory: "medium",
    languages: [{ id: "common" }, { id: "goblin" }],
    description: {
      short: "Stealthy, brutish goblinoids that delight in ambush and cruelty.",
      long: "Bugbears are the largest of the goblinoid races, combining brute strength with a surprising talent for stealth. They prefer ambush over direct confrontation and bully weaker creatures into servitude.",
    },
    mechanics: {
      hitPoints: {
        count: 6,
        die: 8,
        modifier: +6,
      },
      armorClass: { kind: 'equipment', armorRefs: ["hide"] },
      movement: { ground: 30 },
      actions: [
        {
          kind: "special",
          name: "Grab",
          attackBonus: 4,
          reach: 10,
          damage: "2d6",
          damageBonus: 2,
          damageType: "bludgeoning",
          description: "If the target is a Medium or smaller creature, it has the Grappled condition with an escape DC of 12.",
          onSuccess: [
            { kind: 'condition', conditionId: 'grappled', targetSizeMax: 'medium', escapeDc: 12 }
          ]
        },
        { kind: "weapon", weaponRef: "light-hammer" }
      ],
      traits: [{
        name: 'Abduct',
        description:
          'The bugbear needn’t spend extra movement to move a creature it is grappling.',
        trigger: {
          kind: 'while-moving-grappled-creature',
        },
        effects: [
          {
            kind: 'move',
            ignoresExtraCostForGrappledCreature: true,
          },
        ],
      }],
      proficiencies: {
        skills: { stealth: { proficiencyLevel: 2 }, survival: { proficiencyLevel: 1 } },
        weapons: { 'light-hammer': { proficiencyLevel: 1 } },
      },
      proficiencyBonus: 2,
      equipment: {
        weapons: {
          'light-hammer': { 
            weaponId: "light-hammer",
            attackBonus: 4,
            damageOverride: "3d4",
            reach: 10,
            notes: "Has advantage if the target is grappled by the bugbear.",
          },
        },
        armor: {
          hide: { armorId: "hide" },
        },
      },
      senses: {
        special: [{ type: "darkvision", range: 60 }],
        passivePerception: 10,
      },
      abilities: { str: 15, dex: 14, con: 13, int: 8, wis: 11, cha: 9 },
    },
    lore: {
      alignment: "ce",
      challengeRating: 1,
      xpValue: 200,
      intelligence: "average",
    },
  }
];
