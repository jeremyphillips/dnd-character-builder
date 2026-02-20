import type { CharacterClass } from './types'

export const thief = {
  id: 'thief',
  name: 'Thief',
  
  definitions: [
    {
      edition: '2e',
      name: 'Rogue Kit',
      selectionLevel: 1,
      options: [
        // Thief Group Kits
        { id: 'acrobat', name: 'Acrobat', parentId: 'thief', source: 'CTH' },
        { id: 'assassin', name: 'Assassin', parentId: 'thief', source: 'CTH' },
        { id: 'bandit', name: 'Bandit', parentId: 'thief', source: 'CTH' },
        { id: 'burglar', name: 'Burglar', parentId: 'thief', source: 'CTH' },
        { id: 'cutpurse', name: 'Cutpurse', parentId: 'thief', source: 'CTH' },
        { id: 'scout', name: 'Scout', parentId: 'thief', source: 'CTH' },
        { id: 'swashbuckler-thief', name: 'Swashbuckler', parentId: 'thief', source: 'CTH' },
      ]
    }
  ],
  requirements: [
    {
      edition: '2e',
      allowedRaces: 'all',
      levelCaps: { 
        human: 'unlimited', 
        dwarf: 'unlimited', 
        elf: 'unlimited', 
        gnome: 'unlimited', 
        halfElf: 'unlimited', 
        halfling: 'unlimited' 
      },
      minStats: { dexterity: 9 },
      allowedAlignments: ['ng', 'cg', 'ln', 'n', 'cn', 'le', 'ne', 'ce'],
      equipment: {
        armor: {
          categories: [], // 2e doesn't use categories
          individuals: ['leather', 'padded', 'studded-leather']
        },
        weapons: {
          categories: [], // 2e uses individual weapon lists
          individuals: ['club', 'dagger', 'dart', 'hand-crossbow', 'knife', 'lasso', 'shortbow', 'sling', 'broadsword', 'longsword', 'shortsword']
        },
        notes: [
          { id: 'thiefArmorRestriction', text: 'Using Thief Skills in armor heavier than Leather incurs significant penalties.' }
        ]
      },
      startingWealth: {
        classInitialGold: "2d6 * 10", // 2e Rogue roll: 20-120gp
        avgGold: 70,
        goldPerLevel: 200 // Lower than Warrior; Thieves have lower gear overhead
      }
    },
    // 1e AD&D
    {
      edition: '1e',
      allowedRaces: 'all',
      allowedAlignments: ['ng', 'cg', 'ln', 'n', 'cn', 'le', 'ne', 'ce'],
      equipment: { armor: { categories: 'none', individuals: ['leather'] }, weapons: { categories: 'none', individuals: ['club', 'dagger', 'dart', 'shortsword', 'sling'] } },
      startingWealth: {
        classInitialGold: "2d6 * 10", // 1e Thief: 20-120gp
        avgGold: 70,
        goldPerLevel: 150
      }
    },
    // OD&D & Basic (Holmes): humans only — demihumans use race-as-class (Fighting Man)
    {
      edition: 'odd',
      allowedRaces: ['human'],
      allowedAlignments: 'any',
      equipment: { armor: { categories: 'none', individuals: ['leather'] }, weapons: { categories: 'none', individuals: ['dagger', 'shortsword'] } },
      startingWealth: {
        classInitialGold: "3d6 * 10",
        avgGold: 105,
        goldPerLevel: 100
      }
    },
    {
      edition: 'b',
      allowedRaces: ['human'],
      allowedAlignments: 'any',
      equipment: { armor: { categories: 'none', individuals: ['leather'] }, weapons: { categories: 'none', individuals: ['dagger', 'shortsword'] } },
      startingWealth: {
        classInitialGold: "3d6 * 10",
        avgGold: 105,
        goldPerLevel: 100
      }
    }
  ],
  proficiencies: [
    {
      edition: '2e',
      taxonomy: 'Weapon Proficiency',
      choiceCount: 2,
      options: [
        { id: 'club', name: 'Club', cost: 1 },
        { id: 'dagger', name: 'Dagger', cost: 1 },
        { id: 'dart', name: 'Dart', cost: 1 },
        { id: 'hand-crossbow', name: 'Hand Crossbow', cost: 1 },
        { id: 'short-sword', name: 'Short Sword', cost: 1 }
      ]
    },
    {
      edition: '2e',
      taxonomy: 'NWP',
      name: 'Non-Weapon Proficiency',
      choiceCount: 3,
      options: [
        { id: 'appraising', name: 'Appraising', relevantStatId: 'intelligence', checkModifier: 0 },
        { id: 'blindFighting', name: 'Blind-fighting', relevantStatId: 'none', checkModifier: 0 },
        { id: 'disguise', name: 'Disguise', relevantStatId: 'charisma', checkModifier: -1 },
        { id: 'forgery', name: 'Forgery', relevantStatId: 'dexterity', checkModifier: -1 },
        { id: 'gaming', name: 'Gaming', relevantStatId: 'charisma', checkModifier: 0 },
        { id: 'jumping', name: 'Jumping', relevantStatId: 'strength', checkModifier: 0 },
        { id: 'musicalInstrument', name: 'Musical Instrument', relevantStatId: 'dexterity', checkModifier: -1 },
        { id: 'tightropeWalking', name: 'Tightrope Walking', relevantStatId: 'dexterity', checkModifier: -1 },
        { id: 'tumbling', name: 'Tumbling', relevantStatId: 'dexterity', checkModifier: 0 }
      ]
    },
    {
      edition: '2e',
      taxonomy: 'Thief Skill',
      pointPool: {
        initial: 60,
        perLevel: 30
      },
      options: [
        { id: 'pickPockets', name: 'Pick Pockets' },
        { id: 'openLocks', name: 'Open Locks' },
        { id: 'findTrap', name: 'Find/Remove Traps' },
        { id: 'moveSilently', name: 'Move Silently' },
        { id: 'hideInShadows', name: 'Hide in Shadows' },
        { id: 'detectNoise', name: 'Detect Noise' },
        { id: 'climbWalls', name: 'Climb Walls' },
        { id: 'readLanguages', name: 'Read Languages' }
      ]
    }
  ],
  progression: [
    {
      edition: '2e',
      classGroup: 'rogue',
      hitDie: 6,
      attackProgression: 'average',
      primaryAbilities: ['dex'],
      armorProficiency: ['leather', 'padded', 'studded-leather'],
      weaponProficiency: ['club', 'dagger', 'dart', 'hand-crossbow', 'knife', 'shortsword'],
    },
    {
      edition: '1e',
      hitDie: 6,
      attackProgression: 'poor',
      primaryAbilities: ['dex'],
      armorProficiency: ['leather'],
      weaponProficiency: ['club', 'dagger', 'dart', 'shortsword', 'sling'],
    },
  ]
} satisfies CharacterClass

  // choicesByEdition: {
  //   '1': {
  //     type: 'subclass',
  //     label: 'Thief subclass',
  //     options: [
  //       { id: 'assassian', name: 'Assassian' }
  //     ]
  //   }
  // }