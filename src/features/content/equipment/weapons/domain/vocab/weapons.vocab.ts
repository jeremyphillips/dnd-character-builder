export const WEAPON_CATEGORY_OPTIONS = [
  { id: 'simple', name: 'Simple' },
  { id: 'martial', name: 'Martial' },
] as const;

export type WeaponCategory = (typeof WEAPON_CATEGORY_OPTIONS)[number]['id'];

export const WEAPON_MODE_OPTIONS = [
  { id: 'melee', name: 'Melee' },
  { id: 'ranged', name: 'Ranged' },
] as const;

export type WeaponMode = (typeof WEAPON_MODE_OPTIONS)[number]['id'];

export const WEAPON_PROPERTY_OPTIONS = [
  { id: 'light', name: 'Light' },
  { id: 'finesse', name: 'Finesse' },
  { id: 'thrown', name: 'Thrown' },
  { id: 'two-handed', name: 'Two-Handed' },
  { id: 'versatile', name: 'Versatile' },
  { id: 'reach', name: 'Reach' },
  { id: 'special', name: 'Special' },
  { id: 'ammunition', name: 'Ammunition' },
  { id: 'loading', name: 'Loading' },
  { id: 'heavy', name: 'Heavy' },
] as const;

export type WeaponProperty = (typeof WEAPON_PROPERTY_OPTIONS)[number]['id'];

export const WEAPON_DAMAGE_TYPE_OPTIONS = [
  { id: 'bludgeoning', name: 'Bludgeoning' },
  { id: 'piercing', name: 'Piercing' },
  { id: 'slashing', name: 'Slashing' },
  { id: 'none', name: 'None' },
] as const;

export type WeaponDamageType = (typeof WEAPON_DAMAGE_TYPE_OPTIONS)[number]['id'];
