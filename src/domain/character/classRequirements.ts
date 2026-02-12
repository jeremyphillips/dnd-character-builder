// domain/character/classRequirements.ts
import { classes } from '@/data'
import { getById } from '../lookups'
import type { ClassRequirement } from '@/data/classes/types'
import type { EditionId } from '@/data'
import { type CharacterBuilderState } from '@/characterBuilder'

export const getClassRequirement = (
  classId?: string,
  edition?: EditionId
): ClassRequirement | undefined => {
  if (!classId || !edition) return undefined

  const cls = getById(classes, classId)
  if (!cls || !('requirements' in cls) || !cls.requirements) return undefined

  return cls.requirements.find(req => req.edition === edition) as ClassRequirement | undefined
}

export const meetsClassRequirements = (
  cls: any,
  state: CharacterBuilderState
): { allowed: boolean; reason?: string } => {
  const { edition, race, alignment } = state

  if (!cls.requirements || !edition) {
    return { allowed: true }
  }

  const req = cls.requirements.find((r: any) => r.edition === edition)
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
  if (req.alignments && alignment) {
    if (!req.alignments.includes(alignment)) {
      return { allowed: false, reason: 'Alignment restriction' }
    }
  }

  // Minimum stats
//   if (req.minimumStats && stats) {
//     for (const [stat, min] of Object.entries(req.minimumStats)) {
//       if ((stats as any)[stat] < min) {
//         return { allowed: false, reason: 'Stat requirement not met' }
//       }
//     }
//   }

  return { allowed: true }
}
