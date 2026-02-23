import type { Character } from '@/shared/types'
import { weapons as weaponCatalog } from '@/data/equipment/weapons'
import { resolveEquipmentEdition } from '@/features/equipment/domain'
import type { WeaponEditionDatum } from '@/data/equipment/weapons.types'

export type WeaponPickerOption = {
  weaponId: string
  name: string
  type?: 'melee' | 'ranged'
  properties?: string[]
}

function getWeaponEditionData(weaponId: string, editionId: string): WeaponEditionDatum | undefined {
  const resolved = resolveEquipmentEdition(editionId)
  const weapon = weaponCatalog.find((w) => w.id === weaponId)
  return weapon?.editionData?.find((d) => d.edition === resolved)
}

/**
 * Build selectable weapon options from the character's owned weapons.
 *
 * Returns one entry per owned weapon with catalog name and basic properties.
 * The UI uses this to populate the main-hand / off-hand pickers.
 */
export function getWeaponPickerOptions(character: Character): WeaponPickerOption[] {
  const ownedIds = character.equipment?.weapons ?? []
  const editionId = character.edition

  return ownedIds.map((id) => {
    const weapon = weaponCatalog.find((w) => w.id === id)
    const edData = getWeaponEditionData(id, editionId)

    return {
      weaponId: id,
      name: weapon?.name ?? id,
      type: edData?.type,
      properties: edData?.properties,
    }
  })
}
