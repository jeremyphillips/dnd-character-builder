import { classes } from '@/data'
import type { ClassDefinition } from '@/data/classes/types'
import { getById } from '@/domain/lookups'

export const getClassDefinitions = (
  classId?: string,
  edition?: string,
  level: number = 1
): ClassDefinition[] => {
  if (!classId || !edition) return []

  const cls = getById(classes, classId)
  if (!cls) return []

  return cls.definitions.filter((d) => {
    if (d.edition !== edition) return false

    const sel = d.selectionLevel
    if (sel != null) return level >= sel
    return true
  })
}

/** Resolve subclass display name by class id and definition id. */
export function getSubclassNameById(classId?: string, defId?: string): string | null {
  if (!classId || !defId) return null
  const cls = getById(classes, classId)
  if (!cls) return defId

  for (const def of cls.definitions) {
    const opt = def.options.find((o) => o.id === defId)
    if (opt) return opt.name
  }
  return defId
}
