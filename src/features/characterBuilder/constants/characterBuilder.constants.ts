import {
  AlignmentStep,
  ConfirmationStep,
  DetailsStep,
  SettingStep,
  ClassStep,
  EditionStep,
  EquipmentStep,
  LevelStep,
  RaceStep,
  SpellStep
} from '../steps'
import { type CharacterBuilderState } from '../types'
import type { CharacterType } from '@/shared/types/character.core'
import { getClassProgression } from '@/domain/character'

/** Returns true if at least one selected class has a spellProgression for the current edition. */
function isSpellcaster(state: CharacterBuilderState): boolean {
  return state.classes.some(cls => {
    if (!cls.classId || !state.edition) return false
    const prog = getClassProgression(cls.classId, state.edition)
    return prog?.spellProgression != null
  })
}

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
      id: 'spells',
      label: 'Spells',
      component: SpellStep,
      selector: (state: CharacterBuilderState) =>
        (state.spells?.length ?? 0) > 0,
      shouldSkip: (state: CharacterBuilderState) => !isSpellcaster(state)
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
      id: 'details',
      label: 'Details',
      component: DetailsStep,
      selector: (state: CharacterBuilderState) =>
        (state.proficiencies?.length ?? 0) > 0
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
    proficiencies: [],
    spells: [],
    totalLevel: 0,
    wealth: {
      gp: 0,
      sp: 0,
      cp: 0
    }
  }
}
