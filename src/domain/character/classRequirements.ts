// domain/character/classRequirements.ts
import { classes } from '@/data'
import { getById } from '../lookups'
import type { CharacterClass, ClassRequirement } from '@/data/classes/types'
import type { EditionId } from '@/data'
import { type CharacterBuilderState } from '@/characterBuilder'

export const getClassRequirement = (
  classId?: string,
  edition?: EditionId
): ClassRequirement | undefined => {
  if (!classId || !edition) return undefined

  const cls = getById(classes, classId)
  if (!cls) return undefined

  return cls.requirements.find(req => req.edition === edition)
}

export const meetsClassRequirements = (
  cls: CharacterClass,
  state: CharacterBuilderState
): { allowed: boolean; reason?: string } => {
  const { edition, race, alignment } = state

  if (cls.requirements.length === 0 || !edition) {
    return { allowed: true }
  }

  const req = cls.requirements.find((r) => r.edition === edition)
  if (!req) {
    return { allowed: true }
  }

  // Allowed races
  if (req.allowedRaces !== 'all') {
    if (!race || !req.allowedRaces.includes(race)) {
      return { allowed: false, reason: 'Race restriction' }
    }
  }

  // Alignment
  if (req.allowedAlignments !== 'any' && alignment) {
    if (!req.allowedAlignments.includes(alignment)) {
      return { allowed: false, reason: 'Alignment restriction' }
    }
  }

  // Minimum stats
  // TODO: re-enable once stats are wired into CharacterBuilderState
  // if (req.minStats && stats) {
  //   for (const [stat, min] of Object.entries(req.minStats)) {
  //     if ((stats as Record<string, number>)[stat] < min) {
  //       return { allowed: false, reason: 'Stat requirement not met' }
  //     }
  //   }
  // }

  return { allowed: true }
}
