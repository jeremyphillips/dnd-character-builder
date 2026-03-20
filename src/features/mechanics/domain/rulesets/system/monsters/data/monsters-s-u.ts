import type { MonsterCatalogEntry } from '../types';

/** System catalog — ids starting with [s-u] (first character of `id`). */

export const MONSTERS_S_U: readonly MonsterCatalogEntry[] = [
{
    id: "skeleton",
    name: "Skeleton",
    type: "undead",
    sizeCategory: "medium",
    languages: [{ id: "common", speaks: false }],
    description: {
      short: "Animated bones of the dead, mindlessly carrying out their creator's bidding.",
      long: "Skeletons are the animated bones of the dead, given a semblance of life through dark magic. They obey the commands of their creator without question or hesitation.",
    },
    mechanics: {
      hitPoints: {
        count: 2,
        die: 8,
        modifier: +4,
      },
      armorClass: { kind: 'equipment', armorRefs: ["scraps"] },
      movement: { ground: 30 },
      actions: [
        { kind: 'weapon', weaponRef: "shortsword" },
        { kind: 'weapon', weaponRef: "shortbow" },
      ],
      equipment: {
        weapons: {
          shortsword: { weaponId: "shortsword" },
          shortbow: { weaponId: "shortbow" },
        },
        armor: {
          scraps: {
            armorId: "chain-shirt",
            acModifier: -1,
            aliasName: "Armor Scraps",
            notes: "Made from scrap metal and chain mail.",
          },
        },
      },
      proficiencies: {
        weapons: {
          shortsword: { proficiencyLevel: 1 },
          shortbow: { proficiencyLevel: 1 },
        },
      },
      proficiencyBonus: 2,
      abilities: { str: 10, dex: 16, con: 15, int: 6, wis: 8, cha: 5 },
      senses: {
        special: [{ type: "darkvision", range: 60 }],
        passivePerception: 9,
      },
      immunities: ["poison", "exhaustion"],
      vulnerabilities: ["bludgeoning"],
    },
    lore: {
      alignment: "le",
      challengeRating: 0.25,
      xpValue: 50,
      intelligence: "low",
    },
  },
{
    id: "troll",
    name: "Troll",
    type: "giant",
    sizeCategory: "large",
    languages: [{ id: "giant" }],
    description: {
      short: "Loathsome giants with terrible claws and fearsome regeneration.",
      long: "Trolls are fearsome green-skinned giants known for their ability to regenerate even the most grievous wounds. Only fire and acid can permanently halt their regeneration.",
    },
    mechanics: {
      hitPoints: {
        count: 9,
        die: 10,
        modifier: +45,
      },
      armorClass: {
        kind: 'natural',
        offset: 4,
      },
      movement: { ground: 30 },
      actions: [
        {
          kind: "special",
          name: "Multiattack",
          description: "The troll makes three Rend attacks.",
          sequence: [
            { actionName: "Rend", count: 3 }
          ]
        },
        {
          kind: "natural",
          name: "Rend",
          attackType: "claw",
          attackBonus: 7,
          reach: 10,
          damage: "2d6",
          damageBonus: 4,
          damageType: "slashing"
        }
      ],
      bonusActions: [{
        kind: 'special',
        name: 'Charge',
        description: 'The troll moves up to half its Speed straight toward an enemy it can see.',
        movement: {
          upToSpeedFraction: 0.5,
          straightTowardVisibleEnemy: true,
        },
      }],
      senses: {
        special: [{ type: "darkvision", range: 60 }],
        passivePerception: 15,
      },
      abilities: { str: 18, dex: 13, con: 20, int: 7, wis: 9, cha: 7 },
      traits: [
        {
          name: 'Loathsome Limbs',
          description:
            'If the troll ends any turn Bloodied and took 15+ Slashing damage during that turn, one limb is severed and becomes a Troll Limb.',
          uses: {
            count: 4,
            period: 'day',
          },
          trigger: {
            kind: 'turn-end',
          },
          requirements: [
            { kind: 'self-state', state: 'bloodied' },
            { kind: 'damage-taken-this-turn', damageType: 'slashing', min: 15 },
          ],
          effects: [
            {
              kind: 'tracked-part',
              part: 'limb',
              change: {
                mode: 'sever',
                count: 1,
              },
            },
            {
              // Engine caveat: spawn is still partial and does not yet create a fully simulated combatant.
              kind: 'spawn',
              creature: 'Troll Limb',
              count: 1,
              location: 'self-space',
              actsWhen: 'immediately-after-source-turn',
            },
            {
              // Engine caveat: custom tracked-part resource mapping still needs a canonical runtime model.
              kind: 'custom',
              id: 'monster.resource_from_tracked_parts',
              params: {
                resource: 'exhaustion',
                mode: 'set',
                value: 'per-missing-limb',
                part: 'limb',
              },
            },
          ],
          notes:
            'Replacement limbs grow the next time the troll regains Hit Points.',
        },
        {
          name: 'Regeneration',
          description:
            'The troll regains 15 Hit Points at the start of each of its turns. Acid or Fire damage suppresses this trait on its next turn.',
          effects: [
            {
              kind: 'regeneration',
              amount: 15,
              trigger: { kind: 'turn-start', subject: 'self' },
              suppressedByDamageTypes: ['acid', 'fire'],
              suppressionDuration: {
                kind: 'until-turn-boundary',
                subject: 'self',
                turn: 'next',
                boundary: 'end',
              },
              disabledAtZeroHp: true,
            },
          ],
          notes:
            'The troll dies only if it starts its turn with 0 Hit Points and does not regenerate.',
        }
      ],
      proficiencies: {
        skills: { perception: { proficiencyLevel: 2 } },
      },
      proficiencyBonus: 3,
    },
    lore: {
      alignment: "ce",
      challengeRating: 5,
      xpValue: 1800,
      intelligence: "low",
    },
  }
];
