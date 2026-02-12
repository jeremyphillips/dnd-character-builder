// shared/types/character.core.ts

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

export type CharacterType = 'pc' | 'npc'

export type CharacterCore = {
  name: string
  type: CharacterType
  edition: string
  setting?: string

  race?: string
  alignment?: string

  classes: CharacterClassInfo[]
  xp: number
  totalLevel: number
  levelUpPending?: boolean

  stats?: AbilityScores
  hitPoints?: HitPoints
  armorClass?: ArmorClass

  proficiencies?: string[]
  equipment?: Equipment
  wealth?: Wealth
  narrative?: CharacterNarrative
}


export type PlayerCharacter = CharacterCore & {
  type: 'pc'
}

export type NonPlayerCharacter = CharacterCore & {
  type: 'npc'
  source?: 'generated' | 'legacy'
  legacyEdition?: '2e'
}

export type Character = PlayerCharacter | NonPlayerCharacter
