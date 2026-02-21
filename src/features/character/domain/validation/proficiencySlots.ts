import { classes } from '@/data'
import type { ClassProficiencyEntry, ClassProficienciesByEdition } from '@/data/classes/types'
import type { CharacterClassInfo, CharacterProficiencies } from '@/shared/types/character.core'

export interface ProficiencySlotSummary {
  /** Total slots granted across all class skill proficiency groups. */
  totalSlots: number
  /** Number of skills the character has selected. */
  filled: number
  /** Slots still available for selection. */
  remaining: number
  /** True when every skill slot is filled. */
  allFilled: boolean
  /** True when the character has at least one selectable slot. */
  hasAvailableSlots: boolean
}

/**
 * Extract skill choice entries for a class + edition from the new proficiency data.
 */
function getClassSkillChoices(
  classId: string | undefined,
  edition: string | undefined,
): ClassProficiencyEntry[] {
  if (!classId || !edition) return []
  const cls = classes.find(c => c.id === classId)
  if (!cls) return []
  const profs = cls.proficiencies
  if (Array.isArray(profs)) return []
  const edProfs = (profs as ClassProficienciesByEdition)[edition]
  if (!edProfs?.skills) return []
  const entries = Array.isArray(edProfs.skills) ? edProfs.skills : [edProfs.skills]
  return entries.filter(e => e.type === 'choice')
}

/**
 * Aggregate all skill choice entries for a character's class list + edition.
 */
export function getAllSkillChoices(
  characterClasses: CharacterClassInfo[],
  edition: string | undefined,
): ClassProficiencyEntry[] {
  return characterClasses.flatMap(c => getClassSkillChoices(c.classId, edition))
}

/**
 * Calculate how many total skill slots the character has versus how many are filled.
 */
export function getProficiencySlotSummary(
  characterClasses: CharacterClassInfo[],
  edition: string | undefined,
  proficiencies: CharacterProficiencies | undefined,
): ProficiencySlotSummary {
  const choices = getAllSkillChoices(characterClasses, edition)
  const totalSlots = choices.reduce((sum, e) => sum + (e.count ?? e.slots ?? 0), 0)
  const filled = proficiencies?.skills?.length ?? 0
  const remaining = Math.max(0, totalSlots - filled)

  return {
    totalSlots,
    filled,
    remaining,
    allFilled: remaining === 0,
    hasAvailableSlots: totalSlots > 0,
  }
}
