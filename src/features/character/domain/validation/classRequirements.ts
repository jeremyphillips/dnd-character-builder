/**
 * @deprecated Import from '@/features/mechanics/domain/character-build/rules' instead.
 *
 * These functions delegate to the engine-owned class-eligibility module.
 * Kept for backward compatibility with any remaining callers.
 */
import {
  getClassRequirement as engineGetClassRequirement,
  evaluateClassEligibility,
  getClassRestrictionNotes as engineGetClassRestrictionNotes,
} from '@/features/mechanics/domain/character-build/rules'
import type { ClassRequirement, CharacterClass } from '@/data/classes/types'
import type { EditionId } from '@/data'
import { type CharacterBuilderState } from '@/features/characterBuilder/types'

/** @deprecated Use getClassRequirement from '@/features/mechanics/domain/character-build/rules'. */
export const getClassRequirement = (
  classId?: string,
  edition?: EditionId
): ClassRequirement | undefined => engineGetClassRequirement(classId, edition)

/** @deprecated Use evaluateClassEligibility from '@/features/mechanics/domain/character-build/rules'. */
export const meetsClassRequirements = (
  cls: CharacterClass,
  state: CharacterBuilderState
): { allowed: boolean; reason?: string } => {
  const result = evaluateClassEligibility(cls.id, state)
  if (result.allowed) return { allowed: true }
  const reason = result.reasons[0]?.code === 'race_not_allowed' ? 'Race restriction'
    : result.reasons[0]?.code === 'alignment_not_allowed' ? 'Alignment restriction'
    : undefined
  return { allowed: false, reason }
}

/** @deprecated Use getClassRestrictionNotes from '@/features/mechanics/domain/character-build/rules'. */
export const getClassRestrictionNotes = (
  edition: EditionId,
  classIds: string[]
): string[] => engineGetClassRestrictionNotes(edition, classIds)
