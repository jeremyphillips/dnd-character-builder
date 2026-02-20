import { startingWealth5e } from "@/data/startingWealth5e"
import { startingWealth4e } from "@/data/startingWealth4e"
import type { CharacterClass } from './types'

export const barbarian = {
  id: 'barbarian',
  name: 'Barbarian',
  definitions: [
    {
      edition: '5e',
      id: 'primalPath',
      name: 'Primal Path',
      selectionLevel: 3,
      options: [
        { id: 'ancestral-guardian', name: 'Path of the Ancestral Guardian', source: 'XGE' },
        { id: 'battlerager', name: 'Path of the Battlerager', source: 'SCAG' },
        { id: 'beast', name: 'Path of the Beast', source: 'TCOE' },
        { id: 'zealot', name: 'Path of the Zealot', source: 'XGE' },
        { id: 'storm-herald', name: 'Path of the Storm Herald', source: 'XGE' },
        { id: 'totem-warrior', name: 'Path of the Totem Warrior', source: 'PHB' },
        { id: 'berserker', name: 'Path of the Berserker', source: 'PHB' },
        { id: 'wild-magic', name: 'Path of Wild Magic', source: 'TCOE' }
      ]
    },
    {
      edition: '4e',
      name: 'Barbarian Path', // Barbarians were Primal Strikers in 4E
      selectionLevel: null,
      options: [
        { id: 'path-of-the-bear', name: 'Path of the Bear', source: 'PHB2' },
        { id: 'path-of-the-wolf', name: 'Path of the Wolf', source: 'PHB2' },
        { id: 'path-of-the-tiger', name: 'Path of the Tiger', source: 'MP2' },
        { id: 'path-of-the-serpent', name: 'Path of the Serpent', source: 'MP2' }
      ]
    },
    {
      edition: '2e',
      name: 'Barbarian Kit',
      selectionLevel: 1,
      // Note: Barbarian was originally a Fighter Kit in the Complete Fighter's Handbook
      // and later a full class in campaigns like Dark Sun.
      options: [
        { id: 'barbarian', name: 'Barbarian (Fighter Kit)', parentId: 'warrior', source: 'CFH' },
        { id: 'barbarian-ds', name: 'Barbarian (Dark Sun Class)', parentId: 'warrior', source: 'DSRB' },
        { id: 'tribal-warrior', name: 'Tribal Warrior', parentId: 'warrior', source: 'W:ROF' }
      ]
    }
  ],
  requirements: [
    {
      edition: '5e',
      allowedRaces: 'all',
      allowedAlignments: 'any',
      equipment: {
        armor: {
          categories: ['light', 'medium', 'shields'],
          individuals: 'none',
          notes: [
            { id: 'rageArmorRestriction', text: 'You gain no benefit from Rage while wearing Heavy armor.' },
            { id: 'unarmoredDefenseBarb', text: 'While not wearing armor, your AC equals 10 + Dex + Con. You can use a shield and still gain this benefit.' }
          ]
        },
        weapons: {
          categories: 'all',
          individuals: []
        }
      },
      multiclassing: {
        logic: 'and',
        note: 'Requires 13 Strength',
        options: [{ strength: 13 }]
      },
      startingWealth: { ...startingWealth5e }
    },
    {
      edition: '2e',
      allowedRaces: ['human', 'dwarf', 'elf', 'half-elf'],
      levelCaps: { dwarf: 12, elf: 10, halfElf: 12, human: 'unlimited' },
      minStats: { strength: 15, constitution: 15, dexterity: 12 },
      allowedAlignments: ['ng', 'cg', 'n', 'cn', 'ne', 'ce'],
      equipment: {
        armor: {
          categories: 'none',
          individuals: ['padded', 'leather', 'studded-leather', 'hide', 'brigandine', 'scale-mail', 'chain-mail', 'splint-mail']
        },
        weapons: {
          categories: 'none',
          individuals: ['all']
        },
        notes: [
          { id: 'heavyArmorTaboo', text: 'Barbarians typically shun plate armors as they hinder primal movement.' }
        ]
      },
      startingWealth: {
        classInitialGold: "5d4", // 2e Barbarian roll: 5-20gp (Not *10!)
        avgGold: 12,
        goldPerLevel: 400 // High scaling; represents "spoils of war" and heavy gear needs
      }
    },
    // 4e
    {
      edition: '4e',
      allowedRaces: 'all',
      allowedAlignments: 'any',
      equipment: { armor: { categories: ['light', 'hide'], individuals: 'none' }, weapons: { categories: ['simple', 'military'], individuals: 'none' } },
      startingWealth: { ...startingWealth4e }
    }
  ],
  proficiencies: [
    {
      edition: '5e',
      taxonomy: 'Skill',
      choiceCount: 2,
      options: [
        { id: 'animalHandling', name: 'Animal Handling' },
        { id: 'athletics', name: 'Athletics' },
        { id: 'intimidation', name: 'Intimidation' },
        { id: 'nature', name: 'Nature' },
        { id: 'perception', name: 'Perception' },
        { id: 'survival', name: 'Survival' }
      ]
    },
    {
      edition: '5e',
      taxonomy: 'Weapon',
      // Barbarians get everything; logic checks against these category IDs
      options: [
        { id: 'simple', name: 'Simple Weapons', type: 'category' },
        { id: 'martial', name: 'Martial Weapons', type: 'category' }
      ]
    },
    {
      edition: '5e',
      taxonomy: 'Armor',
      options: [
        { id: 'allArmor', name: 'All Armor', type: 'category' },
        { id: 'shields', name: 'Shields', type: 'item' }
      ]
    },
    {
      edition: '2e',
      taxonomy: 'Weapon Proficiency',
      choiceCount: 4,
      canSpecialize: false,
      options: 'all'
    },
    {
      edition: '2e',
      taxonomy: 'NWP',
      choiceCount: 3,
      options: [
        { id: 'endurance', name: 'Endurance', cost: 2 },
        { id: 'fire-building', name: 'Fire-building', cost: 1 },
        { id: 'hunting', name: 'Hunting', cost: 1 },
        { id: 'survival', name: 'Survival', cost: 2 }
      ]
    }
  ],
  progression: [
    {
      edition: '5e',
      hitDie: 12,
      attackProgression: 'good',
      primaryAbilities: ['str', 'con'],
      armorProficiency: ['light', 'medium', 'shields'],
      weaponProficiency: ['all'],
      savingThrows: ['str', 'con'],
      spellcasting: 'none',
      extraAttackLevel: 5,
      asiLevels: [4, 8, 12, 16, 19],
      features: [
        { level: 1, name: 'Rage' },
        { level: 1, name: 'Unarmored Defense' },
        { level: 2, name: 'Reckless Attack' },
        { level: 2, name: 'Danger Sense' },
        { level: 3, name: 'Primal Path' },
        { level: 5, name: 'Extra Attack' },
        { level: 5, name: 'Fast Movement' },
        { level: 7, name: 'Feral Instinct' },
        { level: 9, name: 'Brutal Critical' },
        { level: 11, name: 'Relentless Rage' },
        { level: 15, name: 'Persistent Rage' },
        { level: 18, name: 'Indomitable Might' },
        { level: 20, name: 'Primal Champion' },
      ],
    },
    {
      edition: '4e',
      hitDie: 0,
      hpPerLevel: 6,
      attackProgression: 'good',
      primaryAbilities: ['str', 'con'],
      armorProficiency: ['light', 'hide'],
      weaponProficiency: ['simple', 'military'],
      role: 'Striker',
      powerSource: 'Primal',
      healingSurges: 8,
      surgeValue: '1/4 HP',
      fortitudeBonus: 2,
      reflexBonus: 0,
      willBonus: 0,
    },
    {
      edition: '2e',
      classGroup: 'warrior',
      hitDie: 12,
      attackProgression: 'good',
      primaryAbilities: ['str', 'con', 'dex'],
      armorProficiency: ['padded', 'leather', 'studded-leather', 'hide', 'brigandine', 'scale-mail', 'chain-mail', 'splint-mail'],
      weaponProficiency: ['all'],
    },
  ]
} satisfies CharacterClass