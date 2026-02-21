import { classes } from '@/data'
import type { ClassProficiencyEntry } from '@/data/classes/types'
import { resolveEquipmentEdition } from '@/features/equipment/domain'

export type EquipmentProficiency = {
  categories: string[]
  items: string[]
}

/**
 * Merge an array of ClassProficiencyEntry into a single flat
 * EquipmentProficiency (union of all categories + items).
 */
export function mergeEquipmentProficiency(
  entries: ClassProficiencyEntry[] | undefined,
): EquipmentProficiency {
  const categories: string[] = []
  const items: string[] = []
  if (!entries) return { categories, items }
  for (const e of entries) {
    if (e.categories) categories.push(...e.categories)
    if (e.items) items.push(...e.items)
  }
  return { categories, items }
}

/**
 * Look up a class's equipment proficiency entries for a given edition and slot.
 * Returns the merged categories + items from all entries in that slot.
 * Falls back to empty when the class hasn't been migrated to the new format.
 */
export function getClassEquipmentProficiency(
  classId: string | undefined,
  edition: string | undefined,
  slot: 'weapons' | 'armor',
): EquipmentProficiency {
  const empty: EquipmentProficiency = { categories: [], items: [] }
  if (!classId || !edition) return empty

  const cls = classes.find(c => c.id === classId)
  if (!cls) return empty

  const profs = cls.proficiencies
  if (Array.isArray(profs)) return empty

  const editionProfs = profs[edition]
  if (!editionProfs) return empty

  const entries = editionProfs[slot]
  if (!entries || !Array.isArray(entries)) return empty

  return mergeEquipmentProficiency(entries)
}

/**
 * Filter an equipment catalogue to items allowed by a proficiency.
 *
 * Rules:
 *  - categories 'all' or 'allArmor' → every item in the catalogue
 *  - Otherwise include items whose editionData.category appears in categories
 *  - Additionally include any item whose id appears in the items list
 *  - If both categories and items are empty, nothing is allowed
 */
export const getAllowedEquipment = ({
  items,
  edition,
  proficiency,
}: {
  items: readonly any[]
  edition: string
  proficiency: EquipmentProficiency
}) => {
  const effectiveEdition = resolveEquipmentEdition(edition)
  const cats = proficiency.categories
  const ids = proficiency.items

  if (cats.length === 0 && ids.length === 0) return []

  const allowAll = cats.includes('all') || cats.includes('allArmor')

  return items.filter(item => {
    if (!Array.isArray(item.editionData)) return false

    const editionEntry = item.editionData.find(
      (e: any) => e.edition === effectiveEdition,
    )
    if (!editionEntry) return false

    if (allowAll) return true
    if (cats.length > 0 && cats.includes(editionEntry.category)) return true
    if (ids.includes(item.id)) return true

    return false
  })
}
