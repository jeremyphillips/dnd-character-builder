import {
  AlignmentStep,
  CampaignStep,
  ClassStep,
  EditionStep,
  EquipmentStep,
  LevelStep,
  RaceStep
} from '@/steps'
import { type CharacterBuilderState } from "./characterBuilder.types"

export const STEP_CONFIG = [
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
  },
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
    selector: (state: CharacterBuilderState) => state.totalLevel
  },

] as const

export const INITIAL_CHARACTER_BUILDER_STATE: CharacterBuilderState = {
  step: {
    id: STEP_CONFIG[0].id,
    name: STEP_CONFIG[0].label
  },
  edition: '5e',// undefined,
  campaign: 'forgottenRealms',// undefined,
  race: 'human', // undefined,
  classes: [{ level: 1 }],
  activeClassIndex: 0,
  equipment: {
    armor: [],
    weapons: [],
    weight: 0
  },
  alignment: undefined,
  totalLevel: 10,
  wealth: {
    gp: 0,
    sp: 0,
    cp: 0
  } 
}

