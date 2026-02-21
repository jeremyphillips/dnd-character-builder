import type { Movement } from "../../core/combat.types"
import type { Attack } from "../../core/combat.types"
import type { AbilityScores } from "@/shared/types/character.core"

export interface MechanicsD20 {
  hitDice: number
  hitDieSize: number              // varies by creature type (d4-d12)
  armorClass: number              // ascending (already 5e-style)
  baseAttackBonus: number         // BAB
  movement: Movement              // already in feet
  attacks: Attack[]
  specialAttacks?: string[]
  specialDefenses?: string[]
  abilities?: AbilityScores       // all 6 scores
  // TODO: saves (Fort/Ref/Will)
  // TODO: skills (Record<string, number>)
  // TODO: feats (string[])
  // TODO: damageReduction?: string          — e.g. "10/magic"
  // TODO: spellResistance?: number
  // TODO: grappleModifier?: number          — 3.5e grapple bonus
  // TODO: touchAC?: number                  — touch AC
  // TODO: flatFootedAC?: number             — flat-footed AC
  // TODO: space?: number                    — creature space in feet
  // TODO: reach?: number                    — natural reach in feet
}