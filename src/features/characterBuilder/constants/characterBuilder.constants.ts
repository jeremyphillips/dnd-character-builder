import {
  AlignmentStep,
  ConfirmationStep,
  SettingStep,
  ClassStep,
  EditionStep,
  EquipmentStep,
  LevelStep,
  RaceStep
} from '../steps'
import { type CharacterBuilderState } from '../types'
import type { CharacterType } from '@/shared/types/character.core'

export function getStepConfig(mode: CharacterType) {
  const baseSteps = [
    {
      id: 'race',
      label: 'Race',
      component: RaceStep,
      selector: (state: CharacterBuilderState) => state.race
    },
    {
      id: 'level',
      label: 'Level',
      component: LevelStep,
      selector: (state: CharacterBuilderState) => state.totalLevel
    },
    {
      id: 'class',
      label: 'Class',
      component: ClassStep,
      selector: (state: CharacterBuilderState) =>
        state.classes[0]?.classId
    },
    {
      id: 'alignment',
      label: 'Alignment',
      component: AlignmentStep,
      selector: (state: CharacterBuilderState) => state.alignment
    },
    {
      id: 'equipment',
      label: 'Equipment',
      component: EquipmentStep,
      selector: (state: CharacterBuilderState) => state.equipment
    },
    {
      id: 'confirmation',
      label: 'Confirmation',
      component: ConfirmationStep,
      selector: () => true
    }
  ]

  if (mode === 'pc') {
    return [
      {
        id: 'edition',
        label: 'Edition',
        component: EditionStep,
        selector: (state: CharacterBuilderState) => state.edition
      },
      {
        id: 'setting',
        label: 'Setting',
        component: SettingStep,
        selector: (state: CharacterBuilderState) => state.setting,
        optional: true
      },
      ...baseSteps
    ]
  }

  return baseSteps
}

export function createInitialBuilderState(
  mode: CharacterType,
  campaignEdition?: string,
  campaignSetting?: string
): CharacterBuilderState {
  const steps = getStepConfig(mode)
  return {
    step: { id: steps[0].id, name: steps[0].label },
    type: mode,
    name: undefined,
    xp: 0,
    edition: mode === 'npc' ? campaignEdition : undefined,
    setting: mode === 'npc' ? campaignSetting : undefined,
    race: undefined,
    classes: [{ level: 1 }],
    activeClassIndex: 0,
    equipment: {
      armor: [],
      weapons: [],
      gear: [],
      weight: 0
    },
    alignment: undefined,
    totalLevel: 0,
    wealth: {
      gp: 0,
      sp: 0,
      cp: 0
    }
  }
}
