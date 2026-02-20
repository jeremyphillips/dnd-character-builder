import { classes, type EditionId } from "@/data"
import type { SubclassOption } from '@/data/classes/types'
import { getById } from '@/domain/lookups'

export const getClassChoicesForEdition = (
  classId?: string,
  edition?: EditionId,
  campaignClassOverrides?: { subclassOverrides?: Record<string, { remove?: string[]; add?: string[] }> }
) => {
  if (!classId || !edition) return null

  const parentClass = getById(classes, classId)
  if (!parentClass) return null

  const definition = parentClass.definitions.find(
    (d) => d.edition === edition && Array.isArray(d.options)
  )
  if (!definition?.options) return null

  let options: SubclassOption[] = [...definition.options]

  // Apply campaign-specific subclass overrides
  const subclassOverride = campaignClassOverrides?.subclassOverrides?.[classId]
  if (subclassOverride) {
    if (subclassOverride.remove) {
      options = options.filter(opt => !subclassOverride.remove!.includes(opt.id))
    }
    if (subclassOverride.add) {
      options = Array.from(
        new Map([...options, ...subclassOverride.add.map((id: string) => ({ id, name: id }))].map(o => [o.id, o])).values()
      )
    }
  }

  return {
    label: `${parentClass.name} subclass`,
    options
  }
}
