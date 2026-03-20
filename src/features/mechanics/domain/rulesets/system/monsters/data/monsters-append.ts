import type { MonsterCatalogEntry } from '../types'

/** Additional system monsters (appended after `MONSTERS_CORE_DATA` in `monsters/index.ts`). */
export const MONSTERS_SYSTEM_APPEND_20260320: readonly MonsterCatalogEntry[] = [
  {
    id: 'ghoul',
    name: 'Ghoul',
    type: 'undead',
    sizeCategory: 'medium',
    languages: [{ id: 'common' }],
    description: {
      short: 'Undead horrors that devour flesh and spread paralysis with their claws.',
      long: 'Ghouls haunt graveyards and battlefields, driven by endless hunger for corpses and living flesh.',
    },
    mechanics: {
      resolution: {
        caveats: [
          'Claw paralysis does not exempt elves or Undead targets in encounter resolution; validate at table.',
        ],
      },
      hitPoints: { count: 5, die: 8 },
      armorClass: { kind: 'natural' },
      movement: { ground: 30 },
      abilities: { str: 13, dex: 15, con: 10, int: 7, wis: 10, cha: 6 },
      senses: {
        special: [{ type: 'darkvision', range: 60 }],
        passivePerception: 10,
      },
      proficiencyBonus: 2,
      immunities: ['poison', 'charmed', 'exhaustion', 'poisoned'],
      actions: [
        {
          kind: 'special',
          name: 'Multiattack',
          description: 'The ghoul makes two Bite attacks.',
          sequence: [{ actionName: 'Bite', count: 2 }],
        },
        {
          kind: 'natural',
          name: 'Bite',
          attackType: 'bite',
          attackBonus: 4,
          reach: 5,
          damage: '1d6',
          damageBonus: 2,
          damageType: 'piercing',
          onHitEffects: [{ kind: 'damage', damage: '1d6', damageType: 'necrotic' }],
        },
        {
          kind: 'natural',
          name: 'Claw',
          attackType: 'claw',
          attackBonus: 4,
          reach: 5,
          damage: '1d4',
          damageBonus: 2,
          damageType: 'slashing',
          notes: 'Constitution save vs paralysis for non-elf, non-Undead targets (see resolution caveats).',
          onHitEffects: [
            {
              kind: 'save',
              save: { ability: 'con', dc: 10 },
              onFail: [
                {
                  kind: 'condition',
                  conditionId: 'paralyzed',
                  duration: {
                    kind: 'until-turn-boundary',
                    subject: 'target',
                    turn: 'next',
                    boundary: 'end',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    lore: {
      alignment: 'ce',
      challengeRating: 1,
      xpValue: 200,
      intelligence: 'low',
    },
  },
  {
    id: 'giant-centipede',
    name: 'Giant Centipede',
    type: 'beast',
    sizeCategory: 'small',
    languages: [],
    description: {
      short: 'A venomous many-legged predator.',
      long: 'Giant centipedes skitter through undergrowth and dungeon cracks, delivering debilitating poison.',
    },
    mechanics: {
      hitPoints: { count: 2, die: 6, modifier: 2 },
      armorClass: { kind: 'natural', offset: 2 },
      movement: { ground: 30, climb: 30 },
      abilities: { str: 5, dex: 14, con: 12, int: 1, wis: 7, cha: 3 },
      senses: {
        special: [{ type: 'blindsight', range: 30 }],
        passivePerception: 8,
      },
      proficiencyBonus: 2,
      actions: [
        {
          kind: 'natural',
          name: 'Bite',
          attackType: 'bite',
          attackBonus: 4,
          reach: 5,
          damage: '1d4',
          damageBonus: 2,
          damageType: 'piercing',
          onHitEffects: [
            {
              kind: 'save',
              save: { ability: 'con', dc: 11 },
              onFail: [
                {
                  kind: 'condition',
                  conditionId: 'poisoned',
                  duration: {
                    kind: 'until-turn-boundary',
                    subject: 'target',
                    turn: 'next',
                    boundary: 'start',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    lore: {
      alignment: 'n',
      challengeRating: 0.25,
      xpValue: 50,
      intelligence: 'non',
    },
  },
  {
    id: 'giant-spider',
    name: 'Giant Spider',
    type: 'beast',
    sizeCategory: 'large',
    languages: [],
    description: {
      short: 'A horse-sized hunting spider.',
      long: 'Giant spiders weave deadly webs and ambush prey in forests and ruins.',
    },
    mechanics: {
      hitPoints: { count: 4, die: 10, modifier: 4 },
      armorClass: { kind: 'natural', offset: 1 },
      movement: { ground: 30, climb: 30 },
      abilities: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 },
      senses: {
        special: [{ type: 'darkvision', range: 60 }],
        passivePerception: 14,
      },
      proficiencies: {
        skills: { perception: { proficiencyLevel: 2 }, stealth: { proficiencyLevel: 2 } },
      },
      proficiencyBonus: 2,
      traits: [
        {
          name: 'Spider Climb',
          description:
            'The spider can climb difficult surfaces, including along ceilings, without needing to make an ability check.',
        },
        {
          name: 'Web Walker',
          description:
            'The spider ignores movement restrictions caused by webs, and it knows the location of any other creature in contact with the same web.',
        },
      ],
      actions: [
        {
          kind: 'natural',
          name: 'Bite',
          attackType: 'bite',
          attackBonus: 5,
          reach: 5,
          damage: '1d8',
          damageBonus: 3,
          damageType: 'piercing',
          onHitEffects: [{ kind: 'damage', damage: '2d6', damageType: 'poison' }],
        },
        {
          kind: 'special',
          name: 'Web',
          description:
            'Dexterity Saving Throw: DC 13, one creature the spider can see within 60 feet. Failure: The target has the Restrained condition until the web is destroyed (AC 10; HP 5; Vulnerability to Fire damage; Immunity to Poison and Psychic damage).',
          save: { ability: 'dex', dc: 13 },
          recharge: { min: 5, max: 6 },
          onFail: [{ kind: 'condition', conditionId: 'restrained' }],
          resolution: {
            caveats: ['Web object AC/HP/destruction and ranged targeting limits are not fully modeled in encounter combat.'],
          },
        },
      ],
    },
    lore: {
      alignment: 'n',
      challengeRating: 1,
      xpValue: 200,
      intelligence: 'animal',
    },
  },
  {
    id: 'giant-wasp',
    name: 'Giant Wasp',
    type: 'beast',
    sizeCategory: 'medium',
    languages: [],
    description: {
      short: 'An oversized stinging insect.',
      long: 'Giant wasps are aggressive aerial predators.',
    },
    mechanics: {
      hitPoints: { count: 5, die: 8 },
      armorClass: { kind: 'natural', offset: 1 },
      movement: { ground: 10, fly: 50 },
      abilities: { str: 10, dex: 14, con: 10, int: 1, wis: 10, cha: 3 },
      senses: { passivePerception: 10 },
      proficiencyBonus: 2,
      traits: [
        {
          name: 'Flyby',
          description:
            "The wasp doesn't provoke an Opportunity Attack when it flies out of an enemy's reach.",
          resolution: {
            caveats: ['Opportunity-attack exemption when leaving reach is not automated for monsters.'],
          },
        },
      ],
      actions: [
        {
          kind: 'natural',
          name: 'Sting',
          attackType: 'bite',
          attackBonus: 4,
          reach: 5,
          damage: '1d6',
          damageBonus: 2,
          damageType: 'piercing',
          onHitEffects: [{ kind: 'damage', damage: '2d4', damageType: 'poison' }],
        },
      ],
    },
    lore: {
      alignment: 'n',
      challengeRating: 0.5,
      xpValue: 100,
      intelligence: 'non',
    },
  },
  {
    id: 'goblin-minion',
    name: 'Goblin Minion',
    type: 'fey',
    subtype: 'goblinoid',
    sizeCategory: 'small',
    languages: [{ id: 'common' }, { id: 'goblin' }],
    description: {
      short: 'A scrappy goblin skirmisher.',
      long: 'Goblin minions rely on numbers, stealth, and hit-and-run tactics.',
    },
    mechanics: {
      hitPoints: { count: 2, die: 6 },
      armorClass: { kind: 'natural' },
      movement: { ground: 30 },
      abilities: { str: 8, dex: 15, con: 10, int: 10, wis: 8, cha: 8 },
      senses: {
        special: [{ type: 'darkvision', range: 60 }],
        passivePerception: 9,
      },
      proficiencies: {
        skills: { stealth: { proficiencyLevel: 2 } },
        weapons: { dagger: { proficiencyLevel: 1 } },
      },
      proficiencyBonus: 2,
      actions: [{ kind: 'weapon', weaponRef: 'dagger' }],
      bonusActions: [
        {
          kind: 'special',
          name: 'Nimble Escape',
          description: 'The goblin takes the Disengage or Hide action.',
          effects: [
            { kind: 'action', action: 'disengage' },
            { kind: 'action', action: 'hide' },
          ],
        },
      ],
      equipment: {
        weapons: {
          dagger: {
            weaponId: 'dagger',
            attackBonus: 4,
            notes: 'Gear includes three daggers; one attack profile for melee or thrown.',
          },
        },
      },
    },
    lore: {
      alignment: 'cn',
      challengeRating: 0.125,
      xpValue: 25,
      intelligence: 'average',
    },
  },
  {
    id: 'air-elemental',
    name: 'Air Elemental',
    type: 'elemental',
    sizeCategory: 'large',
    languages: [{ id: 'primordial' }],
    description: {
      short: 'A howling vortex of wind and debris.',
      long: 'Air elementals are destructive storms given purpose, battering foes with thunderous force.',
    },
    mechanics: {
      hitPoints: { count: 12, die: 10, modifier: 24 },
      armorClass: { kind: 'natural' },
      movement: { ground: 10, fly: 90 },
      abilities: { str: 14, dex: 20, con: 14, int: 6, wis: 10, cha: 6 },
      senses: { special: [{ type: 'darkvision', range: 60 }], passivePerception: 10 },
      resistances: ['bludgeoning', 'piercing', 'slashing', 'lightning'],
      immunities: [
        'poison',
        'thunder',
        'exhaustion',
        'grappled',
        'paralyzed',
        'petrified',
        'poisoned',
        'prone',
        'restrained',
        'unconscious',
      ],
      proficiencyBonus: 3,
      traits: [
        {
          name: 'Air Form',
          description:
            "The elemental can enter a creature's space and stop there. It can move through a space as narrow as 1 inch without expending extra movement to do so.",
        },
      ],
      actions: [
        {
          kind: 'special',
          name: 'Multiattack',
          description: 'The elemental makes two Thunderous Slam attacks.',
          sequence: [{ actionName: 'Thunderous Slam', count: 2 }],
        },
        {
          kind: 'natural',
          name: 'Thunderous Slam',
          attackType: 'slam',
          attackBonus: 8,
          reach: 10,
          damage: '2d8',
          damageBonus: 5,
          damageType: 'thunder',
        },
        {
          kind: 'special',
          name: 'Whirlwind',
          description:
            'Strength Saving Throw: DC 13, one Medium or smaller creature in the elemental’s space. Failure: 24 (4d10 + 2) Thunder damage, and the target is pushed up to 20 feet straight away from the elemental and has the Prone condition. Success: Half damage only.',
          save: { ability: 'str', dc: 13 },
          recharge: { min: 4, max: 6 },
          damage: '4d10',
          damageBonus: 2,
          damageType: 'thunder',
          halfDamageOnSave: true,
          onFail: [{ kind: 'condition', conditionId: 'prone' }],
          resolution: {
            caveats: ['Space/size targeting and push vector are not simulated; uses single-target hostile flow.'],
          },
        },
      ],
    },
    lore: {
      alignment: 'n',
      challengeRating: 5,
      xpValue: 1800,
      intelligence: 'low',
    },
  },
  {
    id: 'earth-elemental',
    name: 'Earth Elemental',
    type: 'elemental',
    sizeCategory: 'large',
    languages: [{ id: 'primordial' }],
    description: {
      short: 'A walking landslide of rock and soil.',
      long: 'Earth elementals batter fortifications and burrow through stone.',
    },
    mechanics: {
      hitPoints: { count: 14, die: 10, modifier: 70 },
      armorClass: { kind: 'natural', offset: 8 },
      movement: { ground: 30, burrow: 30 },
      abilities: { str: 20, dex: 8, con: 20, int: 5, wis: 10, cha: 5 },
      senses: {
        special: [
          { type: 'darkvision', range: 60 },
          { type: 'tremorsense', range: 60 },
        ],
        passivePerception: 10,
      },
      vulnerabilities: ['thunder'],
      immunities: ['poison', 'exhaustion', 'paralyzed', 'petrified', 'poisoned', 'unconscious'],
      proficiencyBonus: 3,
      traits: [
        {
          name: 'Earth Glide',
          description:
            'The elemental can burrow through nonmagical, unworked earth and stone. While doing so, the elemental doesn’t disturb the material it moves through.',
        },
        {
          name: 'Siege Monster',
          description: 'The elemental deals double damage to objects and structures.',
          resolution: { caveats: ['Siege damage multiplier not applied automatically to objects.'] },
        },
      ],
      actions: [
        {
          kind: 'special',
          name: 'Multiattack',
          description:
            'The elemental makes two attacks, using Slam or Rock Launch in any combination.',
          sequence: [{ actionName: 'Slam', count: 2 }],
          notes: 'At table, substitute Rock Launch for any Slam step.',
        },
        {
          kind: 'natural',
          name: 'Slam',
          attackType: 'slam',
          attackBonus: 8,
          reach: 10,
          damage: '2d8',
          damageBonus: 5,
          damageType: 'bludgeoning',
        },
        {
          kind: 'natural',
          name: 'Rock Launch',
          attackType: 'slam',
          attackBonus: 8,
          reach: 5,
          damage: '1d6',
          damageBonus: 5,
          damageType: 'bludgeoning',
          notes: 'Ranged 60 ft.; if the target is Large or smaller, it has the Prone condition.',
          onHitEffects: [
            {
              kind: 'condition',
              conditionId: 'prone',
              targetSizeMax: 'large',
            },
          ],
        },
      ],
    },
    lore: {
      alignment: 'n',
      challengeRating: 5,
      xpValue: 1800,
      intelligence: 'low',
    },
  },
  {
    id: 'fire-elemental',
    name: 'Fire Elemental',
    type: 'elemental',
    sizeCategory: 'large',
    languages: [{ id: 'primordial' }],
    description: {
      short: 'A living bonfire that scorches everything nearby.',
      long: 'Fire elementals spread flame and ash wherever they roam.',
    },
    mechanics: {
      hitPoints: { count: 11, die: 10, modifier: 33 },
      armorClass: { kind: 'natural' },
      movement: { ground: 50 },
      abilities: { str: 10, dex: 17, con: 16, int: 6, wis: 10, cha: 7 },
      senses: { special: [{ type: 'darkvision', range: 60 }], passivePerception: 10 },
      resistances: ['bludgeoning', 'piercing', 'slashing'],
      immunities: [
        'fire',
        'poison',
        'exhaustion',
        'grappled',
        'paralyzed',
        'petrified',
        'poisoned',
        'prone',
        'restrained',
        'unconscious',
      ],
      proficiencyBonus: 3,
      traits: [
        {
          name: 'Fire Aura',
          description:
            'At the end of each of the elemental’s turns, each creature in a 10-foot Emanation originating from the elemental takes 5 (1d10) Fire damage.',
          effects: [
            {
              kind: 'note',
              text: 'End-of-turn aura damage to creatures in 10 ft. is not auto-resolved in encounter.',
              category: 'under-modeled',
            },
          ],
        },
        {
          name: 'Fire Form',
          description:
            'The elemental can move through a space as narrow as 1 inch without expending extra movement to do so, and it can enter a creature’s space and stop there. The first time it enters a creature’s space on a turn, that creature takes 5 (1d10) Fire damage.',
          resolution: {
            caveats: ['Enter-space fire damage and movement through occupied squares are not fully automated.'],
          },
        },
        {
          name: 'Illumination',
          description: 'The elemental sheds Bright Light in a 30-foot radius and Dim Light for an additional 30 feet.',
        },
        {
          name: 'Water Susceptibility',
          description:
            'The elemental takes 3 (1d6) Cold damage for every 5 feet the elemental moves in water or for every gallon of water splashed on it.',
          resolution: { caveats: ['Water/cold interaction is narrative; not tracked as automatic damage.'] },
        },
      ],
      actions: [
        {
          kind: 'special',
          name: 'Multiattack',
          description: 'The elemental makes two Burn attacks.',
          sequence: [{ actionName: 'Burn', count: 2 }],
        },
        {
          kind: 'natural',
          name: 'Burn',
          attackType: 'touch',
          attackBonus: 6,
          reach: 5,
          damage: '2d6',
          damageBonus: 3,
          damageType: 'fire',
          notes: 'If the target is a creature or a flammable object, it starts burning.',
        },
      ],
    },
    lore: {
      alignment: 'n',
      challengeRating: 5,
      xpValue: 1800,
      intelligence: 'low',
    },
  },
  {
    id: 'water-elemental',
    name: 'Water Elemental',
    type: 'elemental',
    sizeCategory: 'large',
    languages: [{ id: 'primordial' }],
    description: {
      short: 'A crashing wave of animate water.',
      long: 'Water elementals engulf foes and drag them under.',
    },
    mechanics: {
      hitPoints: { count: 12, die: 10, modifier: 48 },
      armorClass: { kind: 'natural', offset: 2 },
      movement: { ground: 30, swim: 90 },
      abilities: { str: 18, dex: 14, con: 18, int: 5, wis: 10, cha: 8 },
      senses: { special: [{ type: 'darkvision', range: 60 }], passivePerception: 10 },
      resistances: ['acid', 'fire'],
      immunities: [
        'poison',
        'exhaustion',
        'grappled',
        'paralyzed',
        'petrified',
        'poisoned',
        'prone',
        'restrained',
        'unconscious',
      ],
      proficiencyBonus: 3,
      traits: [
        {
          name: 'Freeze',
          description:
            'If the elemental takes Cold damage, its Speed decreases by 20 feet until the end of its next turn.',
          resolution: { caveats: ['Speed reduction from cold is not applied as a runtime modifier yet.'] },
        },
        {
          name: 'Water Form',
          description:
            'The elemental can enter an enemy’s space and stop there. It can move through a space as narrow as 1 inch without expending extra movement to do so.',
        },
      ],
      actions: [
        {
          kind: 'special',
          name: 'Multiattack',
          description: 'The elemental makes two Slam attacks.',
          sequence: [{ actionName: 'Slam', count: 2 }],
        },
        {
          kind: 'natural',
          name: 'Slam',
          attackType: 'slam',
          attackBonus: 7,
          reach: 5,
          damage: '2d8',
          damageBonus: 4,
          damageType: 'bludgeoning',
          notes: 'If the target is Medium or smaller, it has the Prone condition.',
          onHitEffects: [
            {
              kind: 'condition',
              conditionId: 'prone',
              targetSizeMax: 'medium',
            },
          ],
        },
        {
          kind: 'special',
          name: 'Whelm',
          description:
            'Strength Saving Throw: DC 15, each creature in the elemental’s space. Failure: 22 (4d8 + 4) Bludgeoning damage; Large or smaller targets can be grappled and restrained with ongoing damage and suffocation rules.',
          save: { ability: 'str', dc: 15 },
          recharge: { min: 4, max: 6 },
          damage: '4d8',
          damageBonus: 4,
          damageType: 'bludgeoning',
          halfDamageOnSave: true,
          onFail: [{ kind: 'condition', conditionId: 'restrained' }],
          resolution: {
            caveats: [
              'Whelm grapple capacity, ally pull, suffocation, and multi-target space rules are not fully modeled.',
            ],
          },
        },
      ],
    },
    lore: {
      alignment: 'n',
      challengeRating: 5,
      xpValue: 1800,
      intelligence: 'low',
    },
  },
]
