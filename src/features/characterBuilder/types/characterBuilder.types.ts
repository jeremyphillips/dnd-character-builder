import type { CharacterClassInfo, CharacterSheet } from '@/shared'
import type { CharacterType } from '@/shared/types/character.core'

export type { CharacterClassInfo, CharacterSheet }

export type StepId = 'edition' | 'setting' | 'class' | 'equipment' | 'race' | 'level' | 'alignment' | 'confirmation'

export type CharacterBuilderState = CharacterSheet & {
  name?: string
  step: {
    id: StepId
    name: string
  }
  activeClassIndex: number | null
}

export type CharacterBuilderContextValue = {
  state: CharacterBuilderState

  // basic character info
  setCharacterType: (type: CharacterType) => void
  setName: (name: string) => void
  setEdition: (id: string) => void
  setSetting: (id: string) => void
  setRace: (id: string) => void
  setAlignment: (id: string) => void

  // leveling
  setTotalLevels: (lvl: number) => void
  setXp: (xp: number) => void
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
  updateGear: (ids: string[]) => void
  setWeight: (lbs: number) => void

  // flow control
  start: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (stepId: StepId) => void
  resetState: () => void
  isComplete: (state: CharacterBuilderState) => boolean

  // options
  raceOptions: any[]
  classOptions: any[]
}
