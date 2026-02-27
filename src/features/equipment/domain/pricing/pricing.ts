// ---------------------------------------------------------------------------
// MIGRATION NOTE
// ---------------------------------------------------------------------------
// All monetary math should use CP (copper) as the base unit.
// Avoid using moneyToGp for calculations.
// Use:
// - moneyToCp for math
// - formatMoney / formatCp for UI display
// ---------------------------------------------------------------------------

import type { ArmorItem, WeaponItem, GearItem } from '@/data/equipment'
import type { Money } from '@/shared/money/types'
import { moneyToCp, COIN_TO_CP } from '@/shared/money'

export { moneyToCp, COIN_TO_CP }

/**
 * @deprecated Avoid using GP math in UI. Use CP-based helpers instead.
 * Prefer moneyToCp for calculations and formatMoney / formatCp for display.
 */
export const moneyToGp = (money?: Money): number => {
  return moneyToCp(money) / 100
}

/**
 * @deprecated Use getItemCostCp instead.
 */
export const getItemCostGp = (item?: { cost?: Money }) => {
  return moneyToGp(item?.cost)
}

export const getItemCostCp = (item?: { cost?: Money }): number => {
  return moneyToCp(item?.cost)
}

/**
 * @deprecated Use calculateEquipmentCostCp instead.
 */
export const calculateEquipmentCost = (
  weaponIds: string[],
  armorIds: string[],
  gearIds: string[],
  weaponsData: readonly WeaponItem[],
  armorData: readonly ArmorItem[],
  gearData: readonly GearItem[],
): number => {
  return calculateEquipmentCostCp(weaponIds, armorIds, gearIds, weaponsData, armorData, gearData) / 100
}

export const calculateEquipmentCostCp = (
  weaponIds: string[],
  armorIds: string[],
  gearIds: string[],
  weaponsData: readonly WeaponItem[],
  armorData: readonly ArmorItem[],
  gearData: readonly GearItem[],
): number => {
  const weaponMap = new Map(weaponsData.map(w => [w.id, w]))
  const armorMap = new Map(armorData.map(a => [a.id, a]))
  const gearMap = new Map(gearData.map(g => [g.id, g]))

  const weaponCost = weaponIds.reduce((sum, id) => sum + getItemCostCp(weaponMap.get(id)), 0)
  const armorCost = armorIds.reduce((sum, id) => sum + getItemCostCp(armorMap.get(id)), 0)
  const gearCost = gearIds.reduce((sum, id) => sum + getItemCostCp(gearMap.get(id)), 0)

  return weaponCost + armorCost + gearCost
}
