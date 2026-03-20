import type { MonsterCatalogEntry } from '../types';

/** System catalog — ids starting with [g-i] (first character of `id`). */

export const MONSTERS_G_I: readonly MonsterCatalogEntry[] = [
{
    id: "goblin-warrior",
    name: "Goblin Warrior",
    type: "fey",
    subtype: "goblinoid",
    languages: [{ id: "common" }, { id: "goblin" }],
    sizeCategory: "small",
    description: {
      short: "Small, malicious feys that dwell in dark underground lairs.",
      long: "Goblins are small, black-hearted creatures that lair in despoiled dungeons and other dismal settings. Individually weak, they gather in large numbers to torment other creatures.",
    },
    mechanics: {
      hitPoints: {
        count: 3,
        die: 6,
      },
      armorClass: { kind: 'equipment', armorRefs: ["leather", "shield-wood"] },
      movement: { ground: 30 },
      abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
      actions: [
        { kind: 'weapon', weaponRef: "scimitar" },
        { kind: 'weapon', weaponRef: "shortbow" },
      ],
      bonusActions: [{
        kind: 'special',
        name: 'Nimble Escape',
        description: 'The goblin takes the Disengage or Hide action.',
        effects: [
          { kind: 'action', action: 'disengage' },
          { kind: 'action', action: 'hide' },
        ],
      }],
      senses: {
        special: [{ type: "darkvision", range: 60 }],
        passivePerception: 9,
      },
      proficiencies: {
        skills: { stealth: { proficiencyLevel: 2 } },
        weapons: {
          scimitar: { proficiencyLevel: 1 },
          shortbow: { proficiencyLevel: 1 },
        },
      },
      proficiencyBonus: 2,
      equipment: {
        weapons: {
          scimitar: { weaponId: "scimitar" },
          shortbow: { weaponId: "shortbow" },
        },
        armor: {
          leather: { armorId: "leather" },
          'shield-wood': { armorId: "shield-wood" },
        },
      },
    },
    lore: {
      alignment: "ne",
      challengeRating: 0.25,
      xpValue: 50,
      intelligence: "average",
    },
  },
{
    id: "gnoll-warrior",
    name: "Gnoll Warrior",
    type: "fiend",
    languages: [{ id: "gnoll" }],
    sizeCategory: "medium",
    description: {
      short: "Hulking hyena-headed fiends driven by an insatiable hunger.",
      long: "Gnolls are tall, lanky fiends with hyena-like heads. They are savage raiders who worship the demon lord Yeenoghu and leave destruction in their wake.",
    },
    mechanics: {
      hitPoints: { count: 6, die: 8 },
      armorClass: { kind: 'equipment', armorRefs: ["hide", "shield-wood"] },
      movement: { ground: 30 },
      actions: [
        { kind: "natural", name: "Rend", attackType: "claw", attackBonus: 4, reach: 5, damage: "1d6", damageBonus: 2, damageType: "piercing" },
        { kind: "weapon", weaponRef: "bone-spear" },
      ],
      bonusActions: [{
        kind: "special",
        name: "Rampage",
        description: "Immediately after dealing damage to a creature that is already Bloodied, the gnoll moves up to half its Speed and makes one Rend attack.",
        uses: { count: 1, period: "day" },
        effects: [
          {
            kind: 'trigger',
            trigger: 'damage-dealt',
            condition: {
              kind: 'state',
              target: 'target',
              property: 'combat.bloodied',
              equals: true,
            },
            effects: [
              {
                kind: 'move',
                upToSpeedFraction: 0.5,
              },
              {
                kind: 'action',
                action: 'Rend',
              },
            ],
          },
        ],
      }],
      proficiencies: { weapons: { longbow: { proficiencyLevel: 1 } } },
      proficiencyBonus: 2,
      equipment: {
        weapons: { 'bone-bow': { weaponId: "longbow", aliasName: "Bone Bow", damageOverride: "1d10", notes: "Uses a monster-specific bow profile." } },
        armor: { hide: { armorId: "hide" }, 'shield-wood': { armorId: "shield-wood" } },
      },
      senses: { special: [{ type: "darkvision", range: 60 }], passivePerception: 10 },
      abilities: { str: 14, dex: 12, con: 11, int: 6, wis: 10, cha: 7 },
    },
    lore: { alignment: "ce", challengeRating: 0.5, xpValue: 100, intelligence: "low" },
  },
{
    id: "gelatinous-cube",
    name: "Gelatinous Cube",
    type: "ooze",
    sizeCategory: "large",
    languages: [],
    description: {
      short: "A nearly transparent ooze that fills dungeon corridors.",
      long: "The gelatinous cube is a transparent, ten-foot cube of gelatinous material that scours dungeon corridors clean of organic refuse. Treasures of past victims float suspended within its body.",
    },
    mechanics: {
      hitPoints: {
        count: 6,
        die: 10,
        modifier: +30,
      },
      armorClass: { kind: 'natural' },
      movement: { ground: 15 },
      actions: [
        { kind: 'natural', name: 'Pseudopod', attackType: "pseudopod", damage: "3d6", damageBonus: 2, damageType: "acid", attackBonus: 4, reach: 5 },
        {
          kind: 'special',
          name: 'Engulf',
          description:
            'The cube moves up to its Speed without provoking opportunity attacks and can enter the spaces of Large or smaller creatures if it has room to contain them.',
          target: 'creatures-entered-during-move',
          movement: {
            upToSpeed: true,
            noOpportunityAttacks: true,
            canEnterCreatureSpaces: true,
            targetSizeMax: 'large',
          },
          save: {
            ability: 'dex',
            dc: 12,
          },
          onFail: [
            { kind: 'damage', damage: '3d6', damageType: 'acid' },
            {
              kind: 'state',
              stateId: 'engulfed',
              targetSizeMax: 'large',
              escape: {
                dc: 12,
                ability: 'str',
                skill: 'athletics',
                actionRequired: true,
              },
              ongoingEffects: [
                { kind: 'condition', conditionId: 'restrained' },
                { kind: 'damage', damage: '3d6', damageType: 'acid' },
                { kind: 'note', text: 'Target is suffocating.' },
                { kind: 'note', text: 'Target cannot cast spells with verbal components.' },
                { kind: 'move', movesWithSource: true },
              ],
              notes: 'Target takes the acid damage at the start of the cube’s turns.',
            },
          ],
          onSuccess: [
            { kind: 'damage', damage: '3d6', damageType: 'acid' },
            {
              kind: 'move',
              forced: true,
              withinFeetOfSource: 5,
              toNearestUnoccupiedSpace: true,
              failIfNoSpace: true,
            },
          ],
          halfDamageOnSave: true,
        }
      ],
      abilities: { str: 14, dex: 3, con: 20, int: 1, wis: 6, cha: 1 },
      senses: {
        special: [{ type: "blindsight", range: 60 }],
        passivePerception: 8,
      },
      proficiencyBonus: 2,
      immunities: ["acid", "blinded", "charmed", "deafened", "exhaustion", "frightened", "prone"],
      traits: [
        {
          // Engine caveat: full movement + containment + action modifier semantics remain partial/log-first.
          name: 'Ooze Cube',
          description:
            'The cube fills its entire space and is transparent. Other creatures can enter that space, but a creature that does so is subjected to the cube’s Engulf and has Disadvantage on the saving throw. Creatures inside the cube have Total Cover, and the cube can hold one Large creature or up to four Medium or Small creatures inside itself at a time. As an action, a creature within 5 feet of the cube can pull a creature or an object out of the cube by succeeding on a DC 12 Strength (Athletics) check, and the puller takes 10 (3d6) Acid damage.',
          effects: [
            {
              kind: 'containment',
              fillsEntireSpace: true,
              canContainCreatures: true,
              creatureCover: 'total-cover',
              capacity: {
                large: 1,
                mediumOrSmall: 4,
              },
            },
            {
              kind: 'visibility-rule',
              transparent: true,
            },
            {
              kind: 'custom',
              id: 'monster.action_modifier',
              params: {
                actionName: 'Engulf',
                trigger: {
                  kind: 'enters_space',
                },
                saveModifier: 'disadvantage',
              },
            },
            {
              kind: 'check',
              name: 'Pull From Cube',
              actor: 'nearby-creature',
              distanceFeet: 5,
              actionRequired: true,
              target: 'creature-inside',
              check: {
                ability: 'str',
                skill: 'athletics',
                dc: 12,
              },
              onSuccess: [
                { kind: 'damage', damage: '3d6', damageType: 'acid' },
              ],
            },
            {
              kind: 'check',
              name: 'Pull Object From Cube',
              actor: 'nearby-creature',
              distanceFeet: 5,
              actionRequired: true,
              target: 'object-inside',
              check: {
                ability: 'str',
                skill: 'athletics',
                dc: 12,
              },
              onSuccess: [
                { kind: 'damage', damage: '3d6', damageType: 'acid' },
              ],
            },
          ],
        },
        {
          name: 'Transparent',
          description:
            'Even when the cube is in plain sight, a creature must succeed on a DC 15 Wisdom (Perception) check to notice the cube if it hasn’t witnessed the cube move or otherwise act.',
          effects: [
            {
              kind: 'visibility-rule',
              transparent: true,
              noticeCheck: {
                ability: 'wis',
                skill: 'perception',
                dc: 15,
                unlessWitnessedMoveOrAction: true,
              },
            },
          ],
        }
      ],
    },
    lore: {
      alignment: "unaligned",
      challengeRating: 2,
      xpValue: 450,
      intelligence: "non",
    },
  },
{
    id: "hydra",
    name: "Hydra",
    type: "monstrosity",
    sizeCategory: "huge",
    languages: [],
    description: {
      short: "A many-headed reptilian horror that regrows heads when severed.",
      long: "Hydras are massive reptilian creatures with multiple heads. When a head is severed, the hydra can grow two more in its place—unless it has taken fire damage. It can hold its breath for an hour and gains extra reactions for opportunity attacks based on its number of heads.",
    },
    mechanics: {
      hitPoints: {
        count: 16,
        die: 12,
        modifier: 80,
      },
      armorClass: {
        kind: "natural",
        offset: 4,
      },
      movement: { ground: 40, swim: 40 },
      abilities: { str: 20, dex: 12, con: 20, int: 2, wis: 10, cha: 7 },
      actions: [
        {
          kind: "special",
          name: "Multiattack",
          description: "The hydra makes as many Bite attacks as it has heads.",
          sequence: [{ actionName: "Bite", count: 5 }],
          notes: "Number of attacks equals current number of heads.",
        },
        {
          kind: "natural",
          name: "Bite",
          attackType: "bite",
          attackBonus: 8,
          reach: 10,
          damage: "1d10",
          damageBonus: 5,
          damageType: "piercing",
        },
      ],
      traits: [
        {
          name: "Hold Breath",
          description: "The hydra can hold its breath for 1 hour.",
          effects: [
            {
              kind: "hold-breath",
              duration: {
                kind: "fixed",
                value: 1,
                unit: "hour",
              },
            },
          ],
        },
        {
          name: "Multiple Heads",
          description:
            "The hydra has five heads. Whenever the hydra takes 25 damage or more on a single turn, one of its heads dies. The hydra dies if all its heads are dead. At the end of each of its turns when it has at least one living head, the hydra grows two heads for each of its heads that died since its last turn, unless it has taken Fire damage since its last turn. The hydra regains 20 Hit Points when it grows new heads.",
          effects: [
            {
              kind: "tracked-part",
              part: "head",
              initialCount: 5,
              loss: {
                trigger: "damage-taken-in-single-turn",
                minDamage: 25,
                count: 1,
              },
              deathWhenCountReaches: 0,
              regrowth: {
                trigger: "turn-end",
                requiresLivingPart: true,
                countPerPartLostSinceLastTurn: 2,
                suppressedByDamageTypes: ["fire"],
                healHitPoints: 20,
              },
            },
          ],
        },
        {
          name: "Reactive Heads",
          description:
            "For each head the hydra has beyond one, it gets an extra Reaction that can be used only for Opportunity Attacks.",
          effects: [
            {
              // Engine caveat: extra reaction pools are not fully enforced yet.
              kind: "extra-reaction",
              appliesTo: "opportunity-attacks-only",
              count: {
                kind: "per-part-beyond",
                part: "head",
                baseline: 1,
              },
            },
          ],
        },
      ],
      senses: {
        special: [{ type: "darkvision", range: 60 }],
        passivePerception: 16,
      },
      proficiencies: {
        skills: { perception: { proficiencyLevel: 2 } },
      },
      proficiencyBonus: 3,
      immunities: [
        "blinded",
        "charmed",
        "deafened",
        "frightened",
        "stunned",
        "unconscious",
      ],
    },
    lore: {
      alignment: "unaligned",
      challengeRating: 8,
      xpValue: 3900,
    },
  }
];
