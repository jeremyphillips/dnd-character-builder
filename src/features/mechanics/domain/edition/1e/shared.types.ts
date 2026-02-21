import type { Movement, Attack } from "@/features/mechanics/domain/core/combat.types"

export interface Mechanics1e {
  hitDice: number
  hitDieModifier?: number          // e.g. -1 for "1-1" HD notation
  armorClass: number               // descending AC
  thac0: number
  movement: Movement
  attacks: Attack[]
  specialAttacks?: string[]
  specialDefenses?: string[]
  psionicAbility?: { min: number | null; max: number | null }
}