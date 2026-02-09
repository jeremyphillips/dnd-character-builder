import type { ArmorItem, GearItem, WeaponItem } from '@/data'
import { getItemCostGp } from './getItemCostGp'

export const calculateEquipmentCost = (
  weaponIds: string[],
  armorIds: string[],
  gearIds: string[],
  weaponsData: readonly WeaponItem[],
  armorData: readonly ArmorItem[],
  gearData: readonly GearItem[],
  edition: string
): number => {
  const weaponCost = weaponIds.reduce((sum, id) => {
    const w = weaponsData.find(w => w.id === id)
    return sum + (w ? getItemCostGp(w, edition) : 0)
  }, 0)

  const armorCost = armorIds.reduce((sum, id) => {
    const a = armorData.find(a => a.id === id)
    return sum + (a ? getItemCostGp(a, edition) : 0)
  }, 0)

  const gearCost = gearIds.reduce((sum, id) => {
    const g = gearData.find(g => g.id === id)
    return sum + (g ? getItemCostGp(g, edition) : 0)
  }, 0)

  return weaponCost + armorCost + gearCost
}
