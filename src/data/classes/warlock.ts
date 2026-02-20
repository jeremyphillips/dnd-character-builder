import { startingWealth5e } from "@/data/startingWealth5e"
import { startingWealth4e } from "@/data/startingWealth4e"
import type { CharacterClass } from './types'
import { WARLOCK_PACT_SLOTS_5E } from './spellSlotTables'

export const warlock = {
  id: 'warlock',
  name: 'Warlock',
  definitions: [
    {
      edition: '5e',
      id: 'otherworldlyPatron',
      name: 'Otherworldly Patron',
      selectionLevel: 1,
      options: [
        { id: 'archfey', name: 'The Archfey', source: 'PHB' },
        { id: 'celestial', name: 'The Celestial', source: 'XGE' },
        { id: 'fathomless', name: 'The Fathomless', source: 'TCOE' },
        { id: 'fiend', name: 'The Fiend', source: 'PHB' },
        { id: 'genie', name: 'The Genie', source: 'TCOE' },
        { id: 'great-old-one', name: 'The Great Old One', source: 'PHB' },
        { id: 'hexblade', name: 'The Hexblade', source: 'XGE' },
        { id: 'undead', name: 'The Undead', source: 'VRGR' },
        { id: 'undying', name: 'The Undying', source: 'SCAG' }
      ]
    },
    {
      edition: '4e',
      id: 'eldritchPact',
      name: 'Eldritch Pact',
      selectionLevel: 1,
      options: [
        { id: 'fey-pact', name: 'Fey Pact', source: 'PHB' },
        { id: 'infernal-pact', name: 'Infernal Pact', source: 'PHB' },
        { id: 'star-pact', name: 'Star Pact', source: 'PHB' },
        { id: 'dark-pact', name: 'Dark Pact', source: 'FRPG' },
        { id: 'vestige-pact', name: 'Vestige Pact', source: 'AP' }
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
          categories: ['light'],
          individuals: 'none'
        },
        weapons: {
          categories: ['simple'],
          individuals: 'none'
        },
        notes: [
          { id: 'pactOfTheBlade', text: 'Pact of the Blade (Level 3) grants proficiency with any summoned melee weapon.' },
          { id: 'hexbladeBonus', text: 'The Hexblade patron grants proficiency with medium armor, shields, and martial weapons.' }
        ]
      },
      multiclassing: {
        logic: 'and',
        note: 'Requires 13 Charisma',
        options: [{ charisma: 13 }]
      },
      startingWealth: { ...startingWealth5e }
    },
    // 4e
    {
      edition: '4e',
      allowedRaces: 'all',
      allowedAlignments: 'any',
      equipment: { armor: { categories: ['light'], individuals: 'none' }, weapons: { categories: ['simple'], individuals: 'none' } },
      startingWealth: { ...startingWealth4e }
    }
  ],
  proficiencies: [
    {
      edition: '5e',
      taxonomy: 'Skill',
      choiceCount: 2,
      options: [
        { id: 'arcana', name: 'Arcana' },
        { id: 'deception', name: 'Deception' },
        { id: 'history', name: 'History' },
        { id: 'intimidation', name: 'Intimidation' },
        { id: 'investigation', name: 'Investigation' },
        { id: 'nature', name: 'Nature' },
        { id: 'religion', name: 'Religion' }
      ]
    },
    {
      edition: '5e',
      taxonomy: 'Weapon',
      options: [
        { id: 'simple', name: 'Simple Weapons', type: 'category' }
      ]
    },
    {
      edition: '5e',
      taxonomy: 'Armor',
      options: [
        { id: 'light', name: 'Light Armor', type: 'category' }
      ]
    },
  ],
  progression: [
    {
      edition: '5e',
      hitDie: 8,
      attackProgression: 'average',
      primaryAbilities: ['cha', 'con'],
      armorProficiency: ['light'],
      weaponProficiency: ['simple'],
      savingThrows: ['wis', 'cha'],
      spellcasting: 'pact',
      spellProgression: {
        type: 'known',
        cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        spellsKnown:   [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
        spellSlots: WARLOCK_PACT_SLOTS_5E,
        maxSpellLevel: 5,  // Pact slots cap at 5th; Mystic Arcanum covers 6th-9th
        mysticArcanum: [
          { spellLevel: 6, grantedAtClassLevel: 11 },
          { spellLevel: 7, grantedAtClassLevel: 13 },
          { spellLevel: 8, grantedAtClassLevel: 15 },
          { spellLevel: 9, grantedAtClassLevel: 17 },
        ],
      },
      asiLevels: [4, 8, 12, 16, 19],
      features: [
        { level: 1, name: 'Otherworldly Patron' },
        { level: 1, name: 'Pact Magic' },
        { level: 2, name: 'Eldritch Invocations' },
        { level: 3, name: 'Pact Boon' },
        { level: 11, name: 'Mystic Arcanum' },
        { level: 20, name: 'Eldritch Master' },
      ],
    },
    {
      edition: '4e',
      hitDie: 0,
      hpPerLevel: 5,
      attackProgression: 'average',
      primaryAbilities: ['cha', 'con'],
      armorProficiency: ['light'],
      weaponProficiency: ['simple'],
      role: 'Striker',
      powerSource: 'Arcane',
      healingSurges: 6,
      surgeValue: '1/4 HP',
      fortitudeBonus: 0,
      reflexBonus: 1,
      willBonus: 1,
    },
  ]
} satisfies CharacterClass
