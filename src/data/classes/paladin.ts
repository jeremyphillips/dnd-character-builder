import { startingWealth5e } from "@/data/startingWealth5e"
import { startingWealth4e } from "@/data/startingWealth4e"
import { startingWealthTiers35e } from "@/data/startingWealth35e"
import type { CharacterClass } from './types'
import { HALF_CASTER_SLOTS_5E, PALADIN_SLOTS_35E } from './spellSlotTables'

export const paladin = {
  id: 'paladin',
  name: 'Paladin',
  definitions: [
    {
      edition: '5e',
      id: 'sacredOath',
      name: 'Sacred Oath',
      selectionLevel: 3,
      options: [
        { id: 'ancients', name: 'Oath of the Ancients', source: 'PHB' },
        { id: 'conquest', name: 'Oath of Conquest', source: 'XGE' },
        { id: 'crown', name: 'Oath of the Crown', source: 'SCAG' },
        { id: 'devotion', name: 'Oath of Devotion', source: 'PHB' },
        { id: 'glory', name: 'Oath of Glory', source: 'TCOE' },
        { id: 'redemption', name: 'Oath of Redemption', source: 'XGE' },
        { id: 'vengeance', name: 'Oath of Vengeance', source: 'PHB' },
        { id: 'watchers', name: 'Oath of the Watchers', source: 'TCOE' },
        { id: 'oathbreaker', name: 'Oathbreaker', source: 'DMG' }
      ]
    },
    {
      edition: '4e',
      name: 'Paladin Virtue',
      selectionLevel: 1,
      options: [
        { id: 'virtue-of-hospitality', name: 'Virtue of Hospitality', source: 'DP' },
        { id: 'virtue-of-sacrifice', name: 'Virtue of Sacrifice', source: 'DP' },
        { id: 'virtue-of-valor', name: 'Virtue of Valor', source: 'PHB' },
        { id: 'cavalier', name: 'Cavalier', source: 'PHSL' },
        { id: 'blackguard', name: 'Blackguard', source: 'HOFK' }
      ]
    },
    {
      edition: '2e',
      name: 'Paladin Kit',
      selectionLevel: 1,
      options: [
        { id: 'divine-spellcaster', name: 'Divine Spellcaster', parentId: 'warrior', source: 'CPH' },
        { id: 'envoy', name: 'Envoy', parentId: 'warrior', source: 'CPH' },
        { id: 'equerry', name: 'Equerry', parentId: 'warrior', source: 'CPH' },
        { id: 'errant-knight', name: 'Errant Knight', parentId: 'warrior', source: 'CPH' },
        { id: 'ghost-hunter', name: 'Ghost Hunter', parentId: 'warrior', source: 'CPH' },
        { id: 'inquisitor', name: 'Inquisitor', parentId: 'warrior', source: 'CPH' },
        { id: 'medallion-bearer', name: 'Medallion Bearer', parentId: 'warrior', source: 'CPH' },
        { id: 'militarist', name: 'Militarist', parentId: 'warrior', source: 'CPH' },
        { id: 'sky-rider', name: 'Sky Rider', parentId: 'warrior', source: 'CPH' },
        { id: 'squire', name: 'Squire', parentId: 'warrior', source: 'CPH' },
        { id: 'votyrist', name: 'Votarist', parentId: 'warrior', source: 'CPH' },
        { id: 'wyrmslayer', name: 'Wyrmslayer', parentId: 'warrior', source: 'CPH' }
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
          categories: 'all', // Proficient in all armor and shields
          individuals: []
        },
        weapons: {
          categories: 'all', // Proficient in all simple and martial weapons
          individuals: []
        },
        notes: []
      },
      multiclassing: {
        logic: 'and',
        note: 'Requires 13 Strength AND 13 Charisma',
        options: [
          { strength: 13, charisma: 13 }
        ]
      },
      startingWealth: { ...startingWealth5e }
    },
    {
      edition: '2e',
      allowedRaces: ['human'],
      levelCaps: { human: 'unlimited' },
      minStats: { strength: 12, constitution: 9, wisdom: 13, charisma: 17 },
      allowedAlignments: ['lg'],
      equipment: {
        armor: {
          categories: [],
          individuals: 'all' // Warrior group permission
        },
        weapons: {
          categories: [],
          individuals: 'all' // Warrior group permission
        },
        notes: [
          { id: 'holySwordBond', text: 'Special bonuses apply when wielding a Holy Avenger.' }
        ]
      },
      startingWealth: {
        classInitialGold: "5d4 * 10", // 2e Warrior group roll: 50-200gp
        avgGold: 125,
        goldPerLevel: 450 // High end; Paladins require expensive heavy armor and horse tack
      }
    },
    // 1e AD&D
    {
      edition: '1e',
      allowedRaces: ['human'],
      allowedAlignments: ['lg'],
      equipment: { armor: { categories: 'all', individuals: 'all' }, weapons: { categories: 'all', individuals: 'all' } },
      startingWealth: {
        classInitialGold: "5d4 * 10", // 1e Paladin (Warrior group): 50-200gp
        avgGold: 125,
        goldPerLevel: 300
      }
    },
    // 3.5e
    {
      edition: '3.5e',
      allowedRaces: 'all',
      allowedAlignments: ['lg'],
      equipment: { armor: { categories: 'all', individuals: 'all' }, weapons: { categories: 'all', individuals: 'all' } },
      startingWealth: {
        classInitialGold: "6d4 * 10", // 3.5e Paladin: 60-240gp
        avgGold: 150,
        tiers: startingWealthTiers35e
      }
    },
    // 4e
    {
      edition: '4e',
      allowedRaces: 'all',
      allowedAlignments: 'any',
      equipment: { armor: { categories: 'all', individuals: 'all' }, weapons: { categories: ['simple', 'military'], individuals: 'none' } },
      startingWealth: { ...startingWealth4e }
    }
  ],
  proficiencies: [
    {
      edition: '5e',
      taxonomy: 'Skill',
      choiceCount: 2,
      options: [
        { id: 'athletics', name: 'Athletics' },
        { id: 'insight', name: 'Insight' },
        { id: 'intimidation', name: 'Intimidation' },
        { id: 'medicine', name: 'Medicine' },
        { id: 'persuasion', name: 'Persuasion' },
        { id: 'religion', name: 'Religion' }
      ]
    },
    {
      edition: '5e',
      taxonomy: 'Weapon',
      // Paladins get everything; logic checks against these category IDs
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
      edition: '4e',
      taxonomy: 'Trained Skill',
      choiceCount: 3, // Paladins get Religion plus 3 from list
      fixed: [{ id: 'religion', name: 'Religion' }],
      options: [
        { id: 'diplomacy', name: 'Diplomacy' },
        { id: 'endurance', name: 'Endurance' },
        { id: 'heal', name: 'Heal' },
        { id: 'insight', name: 'Insight' },
        { id: 'intimidation', name: 'Intimidation' }
      ]
    },
    {
      edition: '2e',
      taxonomy: 'Non-Weapon Proficiency',
      slots: 3, // Paladins start with 3 NWP slots
      recommended: [
        { id: 'healing', name: 'Healing', cost: 2 },
        { id: 'heraldry', name: 'Heraldry', cost: 1 },
        { id: 'riding-land-based', name: 'Riding (Land-based)', cost: 1 }
      ]
    }
  ],
  progression: [
    {
      edition: '5e',
      hitDie: 10,
      attackProgression: 'good',
      primaryAbilities: ['str', 'cha'],
      armorProficiency: ['all'],
      weaponProficiency: ['all'],
      savingThrows: ['wis', 'cha'],
      spellcasting: 'half',
      spellProgression: {
        type: 'prepared',
        preparedFormula: 'cha+halfLevel',
        spellSlots: HALF_CASTER_SLOTS_5E,
        maxSpellLevel: 5,
      },
      extraAttackLevel: 5,
      asiLevels: [4, 8, 12, 16, 19],
      features: [
        { level: 1, name: 'Divine Sense' },
        { level: 1, name: 'Lay on Hands' },
        { level: 2, name: 'Fighting Style' },
        { level: 2, name: 'Spellcasting' },
        { level: 2, name: 'Divine Smite' },
        { level: 3, name: 'Divine Health' },
        { level: 3, name: 'Sacred Oath' },
        { level: 5, name: 'Extra Attack' },
        { level: 6, name: 'Aura of Protection' },
        { level: 10, name: 'Aura of Courage' },
        { level: 11, name: 'Improved Divine Smite' },
        { level: 14, name: 'Cleansing Touch' },
      ],
    },
    {
      edition: '3.5e',
      hitDie: 10,
      attackProgression: 'good',
      primaryAbilities: ['str', 'wis', 'cha'],
      armorProficiency: ['all'],
      weaponProficiency: ['all'],
      fortSave: 'good',
      refSave: 'poor',
      willSave: 'poor',
      spellProgression: {
        type: 'prepared',
        // 3.5e Paladin: spells start at level 4, based on Wisdom
        spellSlots: PALADIN_SLOTS_35E,
        maxSpellLevel: 4,
      },
    },
    {
      edition: '4e',
      hitDie: 0,
      hpPerLevel: 6,
      attackProgression: 'good',
      primaryAbilities: ['str', 'cha'],
      armorProficiency: ['all'],
      weaponProficiency: ['simple', 'military'],
      role: 'Defender',
      powerSource: 'Divine',
      healingSurges: 10,
      surgeValue: '1/4 HP',
      fortitudeBonus: 1,
      reflexBonus: 1,
      willBonus: 1,
    },
    {
      edition: '2e',
      classGroup: 'warrior',
      hitDie: 10,
      attackProgression: 'good',
      primaryAbilities: ['str', 'wis', 'cha'],
      armorProficiency: ['all'],
      weaponProficiency: ['all'],
    },
    {
      edition: '1e',
      hitDie: 10,
      attackProgression: 'good',
      primaryAbilities: ['str', 'wis', 'cha'],
      armorProficiency: ['all'],
      weaponProficiency: ['all'],
    },
  ]
} satisfies CharacterClass