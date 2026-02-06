import {
  EditionStep,
  CampaignStep,
  RaceStep,
  LevelStep,
  ClassStep,
  EquipmentStep
} from '@/steps'
import { type CharacterBuilderState } from "./characterBuilder.types"

export const STEP_CONFIG = [
  {
    id: 'edition',
    label: 'Edition',
    component: EditionStep,
    selector: (state: CharacterBuilderState) => state.edition
  },
  {
    id: 'campaign',
    label: 'Campaign',
    component: CampaignStep,
    selector: (state: CharacterBuilderState) => state.campaign,
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
    selector: (state: CharacterBuilderState) => state.totalLevels
  },
  {
    id: 'class',
    label: 'Class',
    component: ClassStep,
    selector: (state: CharacterBuilderState) => state.classes[0].classId
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
  edition: undefined,
  campaign: undefined,
  race: undefined,
  classes: [{ level: 1 }],
  activeClassIndex: 0,
  equipment: {
    armor: [],
    weapons: []
  },
  alignment: undefined,
  totalLevels: 1
}

