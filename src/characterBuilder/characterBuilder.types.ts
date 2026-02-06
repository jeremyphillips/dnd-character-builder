export type StepId = 'edition' | 'campaign' | 'class' | 'equipment' | 'race' | 'level'

export type CharacterClassInfo = {
  classId?: string;          // Formerly characterClass
  classDefinitionId?: string // Formerly classDefinition
  level?: number
}

export type CharacterBuilderState = {
  step: {
    id: StepId
    name: string
  }
  classes: CharacterClassInfo[]
  totalLevels: number
  activeClassIndex: number
  edition?: string
  campaign?: string
  race?: string
  equipment?: {
    armor?: string[]
    weapons?: string[]
  }
  alignment?: string
}

export type CharacterBuilderContextValue = {
  state: CharacterBuilderState
  setEdition: (id: string) => void
  setCampaign: (id: string) => void
  setRace: (id: string) => void
  setClassId: (id: string) => void
  setClassDefinitionId: (definitionId: string) => void
  setClassLevel: (lvl: number) => void
  addClass: any
  setWeapons: (id: string[]) => void
  setArmor: (id: string[]) => void
  setAlignment: (id: string) => void
  setTotalLevels: (lvl: number) => void
  start: () => void
  nextStep: () => void
  prevStep: () => void
  isComplete: any,
  raceOptions: any[]
  classOptions: any[]
  // subclassOptions: any[] | null
}