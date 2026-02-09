import { classes, settings, type EditionType } from '@/data'
import { applyOverrides } from '../overrides'

export const getClassOptions = (edition?: EditionType, settingId?: string) => {
  if (!edition) return []

  const classList = Object.values(classes)

  const baseClassIds = classList
    //.filter(cls => cls.choicesByEdition?.[edition])
    .filter(cls => cls.rolesByEdition?.[edition])
    .map(cls => cls.id)

  const setting = settingId ? settings.find(c => c.id === settingId) : null

  const finalClassIds = applyOverrides(baseClassIds, setting?.classOverrides)

  console.log('finalClassIds',finalClassIds)

  return finalClassIds.map(id => {
    const cls = classList.find(c => c.id === id)
    if (cls) return { id: cls.id, name: cls.name }

    // fallback for override-only classes not in base classes
    return { id, name: id[0].toUpperCase() + id.slice(1) } // simple capitalized fallback
  })
}
