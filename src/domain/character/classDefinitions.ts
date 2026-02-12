import { classes } from '@/data'
import { getById } from '../lookups'

export const getClassDefinitions = (
  classId?: string,
  edition?: string,
  level: number = 1
) => {
  if (!classId || !edition) return []

  const cls = getById(classes, classId)
  if (!cls || !('definitions' in cls) || !cls.definitions) return []

  return (cls.definitions as { edition: string; selectionLevel?: number }[]).filter((d) => {
    if (d.edition !== edition) return false

    // support both old + new shapes safely
    const sel = d.selectionLevel
    if (sel != null) return level >= sel
    return true
  })
}

type ClassWithDefinitions = { id: string; definitions?: { id: string; name?: string }[] }

/** Resolve subclass display name by class id and definition id. */
export function getSubclassNameById(classId?: string, defId?: string): string | null {
  if (!classId || !defId) return null
  const cls = getById(classes as unknown as ClassWithDefinitions[], classId)
  if (!cls || !('definitions' in cls) || !cls.definitions) return defId
  const sub = cls.definitions.find((d) => d.id === defId)
  return sub?.name ?? defId
}
