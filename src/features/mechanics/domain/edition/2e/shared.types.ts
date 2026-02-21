import type { MechanicsD20 } from "../../engine/d20/mechanics.types"

export interface Mechanics2e extends MechanicsD20 {
  thac0: number
  specialAttacks?: string[]
  morale?: { category: string; value: number }
  magicRestistance?: number // 0-100%
}
