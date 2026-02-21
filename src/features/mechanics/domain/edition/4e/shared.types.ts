import type { Movement, Attack } from "../../core/combat.types"
import type { AbilityScores } from '@/shared/types/character.core'

export interface Mechanics4e {
  level: number                    // monster level (replaces HD as scaling metric)
  role: string                     // Artillery, Brute, Controller, Lurker, Skirmisher, Soldier
  roleModifier?: string            // Elite, Solo, Minion (omit for standard)
  hitPoints: number                // flat HP (no dice)
  armorClass: number               // ascending
  fortitude: number                // Fortitude defense
  reflex: number                   // Reflex defense
  will: number                     // Will defense
  initiative: number               // initiative modifier
  movement: Movement               // stored in feet (squares × 5)
  attacks: Attack[]
  specialAttacks?: string[]
  specialDefenses?: string[]
  abilities?: AbilityScores
}