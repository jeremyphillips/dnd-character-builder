import { classes } from '@/data'
import type { ClassProficiency } from '@/data/classes/types'
import type { CharacterClassInfo, Proficiency } from '@/shared/types/character.core'

export interface ProficiencySlotSummary {
  /** Total slots granted across all class proficiency groups. */
  totalSlots: number
  /** Number of proficiencies the character has selected. */
  filled: number
  /** Slots still available for selection. */
  remaining: number
  /** True when every proficiency group's choiceCount is fully satisfied. */
  allFilled: boolean
  /** True when the character has at least one selectable slot. */
  hasAvailableSlots: boolean
}

/**
 * Look up proficiency groups for a class + edition from static class data.
 * Mirrors `getClassProficiencyGroups` in DetailsStep but lives in domain
 * so it can be reused by validation and view layers.
 */
export function getClassProficiencyGroups(
  classId: string | undefined,
  edition: string | undefined,
): ClassProficiency[] {
  if (!classId || !edition) return []
  const cls = classes.find(c => c.id === classId)
  if (!cls) return []
  return cls.proficiencies.filter(p => p.edition === edition)
}

/**
 * Aggregate all proficiency groups for a character's class list + edition.
 */
export function getAllProficiencyGroups(
  characterClasses: CharacterClassInfo[],
  edition: string | undefined,
): ClassProficiency[] {
  return characterClasses.flatMap(c => getClassProficiencyGroups(c.classId, edition))
}

/**
 * Calculate how many total slots the character has versus how many are filled.
 */
export function getProficiencySlotSummary(
  characterClasses: CharacterClassInfo[],
  edition: string | undefined,
  proficiencies: Proficiency[] | undefined,
): ProficiencySlotSummary {
  const groups = getAllProficiencyGroups(characterClasses, edition)
  const totalSlots = groups.reduce((sum, g) => sum + (g.choiceCount ?? 0), 0)
  const filled = proficiencies?.length ?? 0
  const remaining = Math.max(0, totalSlots - filled)

  return {
    totalSlots,
    filled,
    remaining,
    allFilled: remaining === 0,
    hasAvailableSlots: totalSlots > 0,
  }
}
