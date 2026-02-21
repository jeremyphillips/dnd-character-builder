import type { Attack, Movement } from "../../core/combat.types"

export interface MechanicsClassicDnD {
  hitDice: number
  hitDieSize: number              // always 8
  hitDiceAsterisks?: number       // 0, 1, 2, etc. — special ability XP scaling
  hitDieModifier?: number         // e.g. -1 for "1-1" HD notation
  armorClass: number              // descending AC
  thac0: number                   // derived from HD (Rules Cyclopedia)
  movement: Movement
  attacks: Attack[]
  specialAttacks?: string[]
  specialDefenses?: string[]
  saveAs: { class: string; level: number }
  morale: number                  // 2–12 scale (2d6)
}