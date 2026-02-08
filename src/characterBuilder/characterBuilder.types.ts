export type StepId = 'edition' | 'campaign' | 'class' | 'equipment' | 'race' | 'level'

export type CharacterClassInfo = {
  classId?: string;          // Formerly characterClass
  classDefinitionId?: string // Formerly classDefinition
  level: number
}

export type CharacterBuilderState = {
  step: {
    id: StepId
    name: string
  }
  classes: CharacterClassInfo[]
  totalLevel: number
  activeClassIndex: number | null
  edition?: string
  campaign?: string
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
    weight?: number
  }
  alignment?: string
}

export type CharacterBuilderContextValue = {
  state: CharacterBuilderState

  // basic character info
  setEdition: (id: string) => void
  setCampaign: (id: string) => void
  setRace: (id: string) => void
  setAlignment: (id: string) => void

  // leveling
  setTotalLevels: (lvl: number) => void
  allocatedLevels: number
  remainingLevels: number

  // classes / multiclassing
  addClass: () => void
  setClassId: (id: string) => void
  setClassDefinitionId: (definitionId: string) => void
  setClassLevel: (classIndex: number, lvl: number) => void
  setActiveClassIndex: (index: number) => void
  updateClassLevel: (index: number, level: number) => void
  removeClass: (index: number) => void
  updateClassDefinition: (index: number, subclassId?: string) => void
  updateSubclass: (index: number, subclassId?: string) => void
  allocateRemainingLevels: () => void
  
  // wealth
  setWealth: (wealth: {
    gp?: number | null
    sp?: number | null
    cp?: number | null
  }) => void

  // equipment
  updateWeapons: (ids: string[]) => void
  updateArmor: (ids: string[]) => void
  setWeight: (lbs: number) => void

  // flow control
  start: () => void
  nextStep: () => void
  prevStep: () => void
  isComplete: (state: CharacterBuilderState) => boolean

  // options
  raceOptions: any[]
  classOptions: any[]
}
