import type { AbilityScores } from '@/shared/types/character.core'
import type { AbilityScoreMethod } from '@/data/types'

const ABILITY_KEYS: (keyof AbilityScores)[] = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
]

/** Roll a single die with `sides` faces (1-indexed). */
function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

/** Roll `count` dice, return the individual results. */
function rollDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => rollDie(sides))
}

/**
 * 4d6 drop lowest: roll four d6, discard the lowest, sum the remaining three.
 * Standard method from 5e PHB.
 */
export function roll4d6DropLowest(): number {
  const rolls = rollDice(4, 6)
  rolls.sort((a, b) => a - b)
  return rolls[1] + rolls[2] + rolls[3]
}

/**
 * 3d6 straight: roll three d6 and sum them.
 * Classic method from earlier editions (1e, 2e, B/X).
 */
export function roll3d6(): number {
  return rollDice(3, 6).reduce((sum, n) => sum + n, 0)
}

/**
 * Average (fixed) scores: returns the standard array (15, 14, 13, 12, 10, 8)
 * commonly used as the "average" or point-buy baseline in 5e.
 */
export function averageScores(): number[] {
  return [15, 14, 13, 12, 10, 8]
}

/**
 * Generate a full set of six ability scores using the specified method.
 * Results are returned as raw score arrays (unassigned to specific abilities)
 * so the caller can let the player arrange them.
 */
export function generateScoreArray(method: AbilityScoreMethod): number[] {
  switch (method) {
    case '4d6-drop-lowest':
      return Array.from({ length: 6 }, () => roll4d6DropLowest())
    case '3d6':
      return Array.from({ length: 6 }, () => roll3d6())
    case 'average':
      return averageScores()
    case 'custom':
      return Array.from({ length: 6 }, () => 10)
  }
}

/**
 * Generate a complete AbilityScores object with scores assigned to abilities
 * in standard order (STR, DEX, CON, INT, WIS, CHA).
 */
export function generateAbilityScores(method: AbilityScoreMethod): AbilityScores {
  const scores = generateScoreArray(method)
  const result: AbilityScores = {}
  for (let i = 0; i < ABILITY_KEYS.length; i++) {
    result[ABILITY_KEYS[i]] = scores[i]
  }
  return result
}

/**
 * Assign generated scores to abilities, placing the highest values on the
 * class's priority abilities first, then distributing the rest in descending
 * order across the remaining abilities.
 *
 * Example: a Fighter with priority ['strength', 'constitution'] and scores
 * [15, 14, 13, 12, 10, 8] → STR 15, CON 14, DEX 13, INT 12, WIS 10, CHA 8
 */
export function prioritizeAbilityScores(
  method: AbilityScoreMethod,
  priority: (keyof AbilityScores)[],
): AbilityScores {
  const scores = generateScoreArray(method).sort((a, b) => b - a)
  const result: AbilityScores = {}

  const remaining = ABILITY_KEYS.filter(k => !priority.includes(k))
  const orderedKeys = [...priority, ...remaining]

  for (let i = 0; i < orderedKeys.length; i++) {
    result[orderedKeys[i]] = scores[i]
  }
  return result
}
