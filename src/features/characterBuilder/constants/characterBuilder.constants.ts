import {
  AlignmentStep,
  SettingStep,
  ClassStep,
  EditionStep,
  EquipmentStep,
  LevelStep,
  RaceStep
} from '../steps'
import { type CharacterBuilderState } from '../types'

export const STEP_CONFIG = [
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
    selector: (state: CharacterBuilderState) => state.classes[0].classId
  },
  {
    id: 'alignment',
    label: 'Alignment',
    component: AlignmentStep,
    selector: (state: any) => state.alignment
  },
  {
    id: 'equipment',
    label: 'Equipment',
    component: EquipmentStep,
    selector: (state: any) => state.equipment
  }
] as const

export const INITIAL_CHARACTER_BUILDER_STATE: CharacterBuilderState = {
  step: {
    id: STEP_CONFIG[0].id,
    name: STEP_CONFIG[0].label
  },
  xp: 0,
  // levelUpPending: false,
  edition: undefined, // '5e'
  setting: undefined, // 'forgottenRealms'
  race: undefined, // 'human',
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
