import { classes, type EditionType } from "@/data"
import { getById } from '../lookups'

export const getClassChoicesForEdition = (
  classId?: string,
  edition?: EditionType,
  campaignClassOverrides?: any
) => {
  if (!classId || !edition) return null

  const parentClass = getById(classes, classId)
  if (!parentClass || !('definitions' in parentClass) || !parentClass.definitions)
    return null

  const definition = parentClass.definitions.find(
    (d: { edition: string; options?: unknown[] }) =>
      d.edition === edition && Array.isArray(d.options)
  )
  if (!definition?.options) return null

  let options = [...definition.options]

  // Apply campaign-specific subclass overrides
  const subclassOverride = campaignClassOverrides?.subclassOverrides?.[classId]
  if (subclassOverride) {
    if (subclassOverride.remove) {
      options = options.filter(opt => !subclassOverride.remove.includes(opt.id))
    }
    if (subclassOverride.add) {
      // optionally allow adding new subclass options dynamically
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
