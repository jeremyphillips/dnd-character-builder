import type { CharacterClass } from './types'
import { artificer } from './artificer'
import { barbarian } from './barbarian'
import { bard } from './bard'
import { fighter } from './fighter'
import { druid } from './druid' 
import { wizard } from './wizard'
import { cleric } from './cleric'
import { paladin } from './paladin'
import { rogue } from './rogue'
import { ranger } from './ranger'
import { monk } from './monk'
import { sorcerer } from './sorcerer'
import { thief } from './thief'
import { warlock } from './warlock'

export const classes: readonly CharacterClass[] = [
  { ...artificer },
  { ...barbarian },
  // Base class in 3.5e / 5e
  // Child of Rogue in 2e
  {...bard},
  {...cleric},
  {...druid},
  { ...fighter },

  // fightingMan stub removed — merged into fighter with displayNameByEdition
  // Alias map routes "fighting-man" -> "fighter" (see classAliases.ts)

  /* ────────────────────────────── */
  /* GLADIATOR                      */
  /* ────────────────────────────── */
  {
    id: 'gladiator',
    name: 'Gladiator',
    definitions: [],
    requirements: [],
    proficiencies: []
  },
  { id: 'duskblade', name: 'Duskblade', definitions: [], requirements: [], proficiencies: [] },

  // magicUser stub removed — merged into wizard with displayNameByEdition
  // Alias map routes "magic-user" -> "wizard" and "mage" -> "wizard" (see classAliases.ts)

  { ...monk },

  /* ────────────────────────────── */
  /* PRIEST (2e grouping only)      */
  /* ────────────────────────────── */
  {
    id: 'priest',
    name: 'Priest',
    definitions: [],
    requirements: [],
    proficiencies: [
      // {
      //   edition: '2e',
      //   taxonomy: 'NWP',
      //   name: 'Non-Weapon Proficiencies',
      //   options: [
      //     { id: 'ancientHistory', name: 'Ancient History', relevantStatId: 'intelligence', checkModifier: -1 },
      //     { id: 'astrology', name: 'Astrology', ability: 'intelligence', checkModifier: 0 },
      //     { id: 'healing', name: 'Healing', ability: 'wisdom', checkModifier: -2 },
      //     { id: 'herbalism', name: 'Herbalism', ability: 'intelligence', checkModifier: -2 },
      //     { id: 'localHistory', name: 'Local History', ability: 'charisma', checkModifier: 0 },
      //     { id: 'religion', name: 'Religion', ability: 'wisdom', checkModifier: 0 }
      //   ]
      // }
    ]
    // rolesByEdition: {
    //   '2': 'group'
    // },

    // selectableByEdition: {
    //   '2': false
    // },

    // choicesByEdition: {
    //   '2': {
    //     type: 'subclass',
    //     label: 'Priest Class',
    //     options: [
    //       { id: 'cleric', name: 'Cleric' },
    //       { id: 'druid', name: 'Druid' },
    //       { id: 'barbarianShaman', name: 'Barbarian Shaman' }
    //     ]
    //   }
    // }
  },

  { ...paladin },
  {... ranger },
  { ...rogue },
  { ...sorcerer },
  { ...thief },
  { ...warlock },

  /* ────────────────────────────── */
  /* Warlord                        */
  /* ────────────────────────────── */
  {
    id: 'warlord',
    name: 'Warlord',
    definitions: [],
    requirements: [],
    proficiencies: []
    // rolesByEdition: {
    //   '4': 'base'
    // },

    // selectableByEdition: {
    //   '4': true
    // }
  },

  /* ────────────────────────────── */
  /* WARRIOR (2e grouping only)     */
  /* ────────────────────────────── */
  {
    id: 'warrior',
    name: 'Warrior',
    definitions: [],
    requirements: [],
    proficiencies: [
      // {
      //   edition: '2e',
      //   taxonomy: 'NWP',
      //   name: 'Non-Weapon Proficiencies',
      //   options: [
      //     { id: 'appraising', name: 'Appraising', relevantStatId: 'intelligence', checkModifier: 0 },
      //     { id: 'blindFighting', name: 'Blind-fighting', relevantStatId: 'none', checkModifier: 0 },
      //     { id: 'disguise', name: 'Disguise', relevantStatId: 'charisma', checkModifier: -1 },
      //     { id: 'forgery', name: 'Forgery', relevantStatId: 'dexterity', checkModifier: -1 },
      //     { id: 'gaming', name: 'Gaming', relevantStatId: 'charisma', checkModifier: 0 },
      //     { id: 'jumping', name: 'Jumping', relevantStatId: 'strength', checkModifier: 0 },
      //     { id: 'musicalInstrument', name: 'Musical Instrument', relevantStatId: 'dexterity', checkModifier: -1 },
      //     { id: 'tightropeWalking', name: 'Tightrope Walking', relevantStatId: 'dexterity', checkModifier: -1 },
      //     { id: 'tumbling', name: 'Tumbling', relevantStatId: 'dexterity', checkModifier: 0 }
      //   ]
      // }
    ]

    // rolesByEdition: {
    //   '2': 'group'
    // },

    // selectableByEdition: {
    //   '2': false
    // },

    // choicesByEdition: {
    //   '2': {
    //     type: 'subclass',
    //     label: 'Warrior Class',
    //     options: [
    //       { id: 'fighter', name: 'Fighter' },
    //       { id: 'ranger', name: 'Ranger' },
    //       { id: 'paladin', name: 'Paladin' },
    //       { id: 'barbarianFighter', name: 'Barbarian Fighter' }
    //     ]
    //   }
    // }
  },

  /* ────────────────────────────── */
  /* WIZARD                         */
  /* ────────────────────────────── */
  { ...wizard }

 ]
