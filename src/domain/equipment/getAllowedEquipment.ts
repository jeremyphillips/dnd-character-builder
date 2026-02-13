import type { EquipmentRequirement } from '@/data'
import { resolveEquipmentEdition } from './editionMap'

export const getAllowedEquipment = ({
  items,
  edition,
  requirement
}: {
  items: readonly any[]
  edition: string
  requirement: EquipmentRequirement
}) => {
  const effectiveEdition = resolveEquipmentEdition(edition)

  // Explicitly nothing allowed
  if (
    requirement.categories === 'none' &&
    requirement.individuals === 'none'
  ) {
    return []
  }

  return items.filter(item => {
    if (!Array.isArray(item.editionData)) {
      return false
    }

    const editionEntry = item.editionData.find(
      (e: any) => e.edition === effectiveEdition
    )

    if (!editionEntry) {
      return false
    }

    // material gate (Druid-style)
    if (
      requirement.disallowedMaterials?.includes(item.material)
    ) {
      return false
    }

    // global allow
    if (
      requirement.categories === 'all' ||
      requirement.individuals === 'all'
    ) {
      return true
    }

    let allowedByCategory = false
    let allowedByIndividual = false

    // category allow
    if (
      Array.isArray(requirement.categories) &&
      requirement.categories.length > 0
    ) {
      allowedByCategory =
        requirement.categories.includes(editionEntry.category)
    }

    // individual allow
    if (
      Array.isArray(requirement.individuals) &&
      requirement.individuals.length > 0
    ) {
      allowedByIndividual =
        requirement.individuals.includes(item.id)
    }

    return allowedByCategory || allowedByIndividual
  })
}
