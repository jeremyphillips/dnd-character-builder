export type CharacterClassInfo = {
  classId?: string
  classDefinitionId?: string
  level: number
}

export type CharacterSheet = {
  classes: CharacterClassInfo[]
  xp: number
  totalLevel: number
  levelUpPending?: boolean
  edition?: string
  setting?: string
  race?: string
  wealth?: {
    gp?: number | null
    sp?: number | null
    cp?: number | null
    baseGp?: number | null
  }
  equipment?: {
    armor?: string[]
    weapons?: string[]
    gear?: string[]
    weight?: number
  }
  alignment?: string
}
