import { armor } from './armor'
import { weapons } from './weapons'
import { gear } from './gear'
import { magicItems } from './magicItems'

export const equipment = {
  armor,
  weapons,
  gear,
  magicItems
}

export type { EquipmentEditionDatumBase, EquipmentItemBase } from './equipment.types'
export type { GearItem, GearCategory, GearEditionDatum } from './gear.types'
export type { ArmorItem, ArmorMaterial, ArmorEditionDatum, ArmorCategory, ArmorEncumbrance2e } from './armor.types'
export type { WeaponItem, WeaponDamageType, WeaponDamage, WeaponEditionDatum, WeaponCategory, WeaponType } from './weapons.types'
export type { MagicItem, MagicItemEditionDatum, MagicItemRarity, MagicItemSlot } from './magicItems.types'