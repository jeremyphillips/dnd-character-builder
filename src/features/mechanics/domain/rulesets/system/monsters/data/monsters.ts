import type { MonsterCatalogEntry } from '../types'
import { MONSTERS_A_C } from './monsters-a-c'
import { MONSTERS_D_F } from './monsters-d-f'
import { MONSTERS_G_I } from './monsters-g-i'
import { MONSTERS_J_L } from './monsters-j-l'
import { MONSTERS_M_O } from './monsters-m-o'
import { MONSTERS_P_R } from './monsters-p-r'
import { MONSTERS_S_U } from './monsters-s-u'
import { MONSTERS_V_Z } from './monsters-v-z'

/** Core system monsters (letter-range shards under `./monsters-*.ts`). */
export const MONSTERS_CORE_DATA: readonly MonsterCatalogEntry[] = [
  ...MONSTERS_A_C,
  ...MONSTERS_D_F,
  ...MONSTERS_G_I,
  ...MONSTERS_J_L,
  ...MONSTERS_M_O,
  ...MONSTERS_P_R,
  ...MONSTERS_S_U,
  ...MONSTERS_V_Z,
]
