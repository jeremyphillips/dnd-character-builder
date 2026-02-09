import { classes } from '@/data'
import { getById } from '../lookups'

export const getClassDefinitions = (
  classId?: string,
  edition?: string,
  level: number = 1
) => {
  if (!classId || !edition) return []

  const cls = getById(classes, classId)
  if (!cls?.definitions) return []

  return cls.definitions.filter(d => {
    if (d.edition !== edition) return false

    // support both old + new shapes safely
    if ('selectionLevel' in d) {
      return level >= d.selectionLevel
    }

    // if ('selectionLevels' in d) {
    //   return d.selectionLevels.some(lvl => level >= lvl)
    // }

    return true
  })
}
