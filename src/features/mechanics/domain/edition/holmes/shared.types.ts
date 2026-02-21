import type { Mechanics1e } from "../1e/shared.types"
import type { LoreBase } from "../shared/monster.types"

export type MechanicsHolmes = Omit<Mechanics1e, 'psionicAbility'>

export interface LoreHolmes extends LoreBase {
  numberAppearing?: string // single dice expression (e.g. "2d4")
  percentInLair?: number
  treasureType?: string
  intelligence?: string
}