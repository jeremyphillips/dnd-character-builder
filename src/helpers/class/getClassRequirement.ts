import { classes } from '@/data'
import { getById } from '../lookups'
import type { ClassRequirement } from '@/data/classes/types'
import type { EditionId } from '@/data'

export const getClassRequirement = (
  classId?: string,
  edition?: EditionId
): ClassRequirement | undefined => {
  if (!classId || !edition) return undefined

  const cls = getById(classes, classId)
  if (!cls || !('requirements' in cls) || !cls.requirements) return undefined

  return cls.requirements.find(req => req.edition === edition) as ClassRequirement | undefined
}
