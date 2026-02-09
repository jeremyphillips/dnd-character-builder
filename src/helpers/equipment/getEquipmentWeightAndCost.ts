import type { ArmorItem, GearItem, WeaponItem } from '@/data'
import { calculateEquipmentCost } from './calculateEquipmentCost'
import { calculateEquipmentWeight } from './calculateEquipmentWeight'

export const getEquipmentWeightAndCost = (
  weaponIds: string[],
  armorIds: string[],
  gearIds: string[],
  weaponsData: readonly WeaponItem[],
  armorData: readonly ArmorItem[],
  gearData: readonly GearItem[],
  edition: string
): { weight: number; equipmentCost: number } => {
  const weight = calculateEquipmentWeight(
    weaponIds,
    armorIds,
    gearIds,
    weaponsData,
    armorData,
    gearData
  )
  const equipmentCost = calculateEquipmentCost(
    weaponIds,
    armorIds,
    gearIds,
    weaponsData,
    armorData,
    gearData,
    edition
  )
  return { weight, equipmentCost }
}
