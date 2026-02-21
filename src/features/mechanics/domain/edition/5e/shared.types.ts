import type { MechanicsBase } from "../../core/combat.types"
import type { AbilityScores } from "@/features/mechanics/domain/core/abilityScores.types"

export interface Mechanics5e extends MechanicsBase {
  attackBonus: number
  proficiencyBonus?: number
  abilities?: AbilityScores
  traits?: string[]
  actions?: Array<{ name: string; bonus: number; damage: string }>
}