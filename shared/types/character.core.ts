// shared/types/character.core.ts

import type { EditionId, SettingId } from "@/data"

// 2e specific
export type AbilityScores2e = AbilityScores & {
  strengthPercentile?: number
}

export type SavingThrows2e = {
  paralyzationPoisonDeath?: number
  rodStaffWand?: number
  petrificationPolymorph?: number
  breathWeapon?: number
  spell?: number
}

export type AbilityScores = {
  strength?: number | null
  dexterity?: number | null
  constitution?: number | null
  intelligence?: number | null
  wisdom?: number | null
  charisma?: number | null
}

export type Wealth = {
  gp?: number | null
  sp?: number | null
  cp?: number | null
  baseGp?: number | null
}

export type Equipment = {
  armor?: string[]
  weapons?: string[]
  gear?: string[]
  magicItems?: string[]
  weight?: number
}

export type CharacterClassInfo = {
  classId?: string
  classDefinitionId?: string
  level: number
}

export type CharacterNarrative = {
  personalityTraits?: string[]
  ideals?: string
  bonds?: string
  flaws?: string
  backstory?: string
}

export type HitPoints = {
  total?: number | null
  generationMethod?: string
}

export type ArmorClass = {
  base?: number
  current?: number | null
  calculation?: string
}

export type ProficiencyTaxonomy =
  | 'Skill'               // 5e skill proficiency
  | 'Tool'                // 5e tool proficiency
  | 'Proficiencies'       // generic / 3e
  | 'NWP'                 // 2e non-weapon proficiency
  | 'Weapon Proficiency'  // 2e weapon proficiency
  | 'Trained Skill'       // 4e trained skill

export type Proficiency = {
  id: string
  name: string
  edition: EditionId
  taxonomy: ProficiencyTaxonomy
  choiceCount?: number
  canSpecialize?: boolean // 2e specific
  option: {
    id: string
    name: string
    // 2e specific
    relevantStatId?: string
    checkModifier?: number
  }
}

export type CharacterType = 'pc' | 'npc'

export type CharacterCore = {
  name: string
  type: CharacterType
  edition: EditionId
  setting?: SettingId

  race?: string
  alignment?: string

  classes: CharacterClassInfo[]
  xp: number
  totalLevel: number
  levelUpPending?: boolean

  stats?: AbilityScores
  hitPoints?: HitPoints
  armorClass?: ArmorClass

  proficiencies?: Proficiency[]
  spells?: string[]              // selected spell IDs from the spell catalog
  equipment?: Equipment
  wealth?: Wealth
  narrative?: CharacterNarrative
}

export type Rules2e = {
  stats?: AbilityScores2e
  thac0?: number
  savingThrows?: SavingThrows2e
}

// export type Character5e = CharacterCore & {
//   edition: '5e'
// }

// export type Character2e = Omit<CharacterCore,
//   | 'stats'
// > & {
//   edition: '2e'
//   stats?: AbilityScores2e
//   savingThrows?: SavingThrows2e
//   thac0?: number
// }


export type PlayerCharacter = CharacterCore & {
  type: 'pc'
}

export type NonPlayerCharacter = CharacterCore & {
  type: 'npc'
  source?: 'generated' | 'legacy'
  legacyEdition?: '2e'
  id: string
}

/**
 * Working state used by the character builder.
 * Fields that are required on the final CharacterCore are optional here
 * because they're filled in progressively during the build flow.
 */
export type CharacterSheet = Omit<Partial<CharacterCore>, 'classes'> & {
  classes: CharacterClassInfo[]
}

export type Character =
  | (CharacterCore & { edition: '5e' })
  | (CharacterCore & { edition: '2e'; rules?: Rules2e })
  | CharacterCore
