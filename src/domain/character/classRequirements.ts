// domain/character/classRequirements.ts
import { classes } from '@/data'
import { getById } from '../lookups'
import type { CharacterClass, ClassRequirement } from '@/data/classes/types'
import type { AlignmentId, EditionId } from '@/data'
import { type CharacterBuilderState } from '@/characterBuilder'

/**
 * Maps editions that don't have their own class-requirement entries to the
 * nearest compatible edition.  BECMI and B/X are variants of Basic D&D, so
 * they fall back to 'b' where class data already exists.
 */
const CLASS_EDITION_FALLBACK: Record<string, string> = {
  'becmi': 'b',
  'bx':    'b'
}

/** Try the exact edition first, then fall back via CLASS_EDITION_FALLBACK. */
const findRequirement = (
  requirements: ClassRequirement[],
  edition: string
): ClassRequirement | undefined =>
  requirements.find(r => r.edition === edition)
  ?? requirements.find(r => r.edition === CLASS_EDITION_FALLBACK[edition])

export const getClassRequirement = (
  classId?: string,
  edition?: EditionId
): ClassRequirement | undefined => {
  if (!classId || !edition) return undefined

  const cls = getById(classes, classId)
  if (!cls) return undefined

  return findRequirement(cls.requirements, edition)
}

export const meetsClassRequirements = (
  cls: CharacterClass,
  state: CharacterBuilderState
): { allowed: boolean; reason?: string } => {
  const { edition, race, alignment } = state

  if (cls.requirements.length === 0 || !edition) {
    return { allowed: true }
  }

  const req = findRequirement(cls.requirements, edition)
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
    if (!req.allowedAlignments.includes(alignment as AlignmentId)) {
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

/**
 * Generate human-readable restriction notes for the class selection step.
 * Examines each class available in the edition and surfaces race restrictions,
 * alignment restrictions, etc. as informational notes.
 */
export const getClassRestrictionNotes = (
  edition: EditionId,
  classIds: string[]
): string[] => {
  const notes: string[] = []
  const humanOnly: string[] = []
  const openToAll: string[] = []

  for (const classId of classIds) {
    const cls = getById(classes, classId) as CharacterClass | undefined
    if (!cls) continue

    const req = findRequirement(cls.requirements, edition)
    if (!req) continue

    const displayName =
      cls.displayNameByEdition?.[edition] ?? cls.name

    if (req.allowedRaces === 'all') {
      openToAll.push(displayName)
    } else if (
      req.allowedRaces.length === 1 &&
      req.allowedRaces[0] === 'human'
    ) {
      humanOnly.push(displayName)
    }
  }

  // Race-as-class note: group all human-only classes into one note
  if (humanOnly.length > 0 && openToAll.length > 0) {
    const classList = humanOnly.join(', ')
    const openClass = openToAll.join(', ')
    notes.push(
      `Only Humans may be ${classList}. Demihumans are restricted to ${openClass}.`
    )
  } else if (humanOnly.length > 0) {
    const classList = humanOnly.join(', ')
    notes.push(`Only Humans may be ${classList}.`)
  }

  return notes
}
