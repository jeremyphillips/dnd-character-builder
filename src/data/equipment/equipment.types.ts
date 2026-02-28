import type { Money } from '@/shared/money/types'
import type { Weight } from '@/shared/weight/types'

export type EquipmentBase = {
  id: string
  name: string
  description?: string
  weight?: Weight
}

export type ArmorCategory =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'shields';

type DexContribution =
  | { mode: 'full' }
  | { mode: 'capped'; maxBonus: number }  // e.g. 2
  | { mode: 'none' };

export type Material = 'metal' | 'organic' | 'fabric' | 'wood' | 'stone'

export interface ArmorItem extends EquipmentBase {
  cost: Money
  category: ArmorCategory;
  material: Material
  baseAC?: number
  dex?: DexContribution
  stealthDisadvantage?: boolean
  minStrength?: number
  acBonus?: number
}

export type GearCategory =
  | 'packs-containers'
  | 'lighting-fuel'
  | 'rope-climbing'
  | 'tools-utility'
  | 'adventuring-utility'
  | 'writing-knowledge'
  | 'kits-focuses'
  | 'rations-consumables'
  | 'clothing'
  | 'misc-tools'
  | 'cases-quivers'
  | 'tent-camp'
  | 'luxury-special'
  | 'potions-alchemical';

export type GearProperty =
  | 'magnification'

export interface GearItem extends EquipmentBase {
  cost: Money
  category: GearCategory;
  properties?: GearProperty[];
  // Containers / storage
  capacity?: string;
  // Lighting
  range?: string;
  duration?: string;
  // Rope / climbing (5e-ish where applicable)
  hp?: number;
  burstDC?: number;
  // Kits / consumables
  charges?: number;
  // Writing
  pages?: number;
  // Rations
  type?: string;
  // Potions / alchemical
  effect?: string;
  // Focus / proficiency
  proficiency?: string;
  // Focus kind (spellcasting focus, implement, etc.)
  kind?: string;
};

export type WeaponCategory =
  | 'simple'
  | 'martial';

export type WeaponProperty =
  | 'light'
  | 'finesse'
  | 'thrown'
  | 'two-handed'
  | 'versatile'
  | 'reach'
  | 'special'
  | 'ammunition'
  | 'loading'
  | 'heavy'
  | 'two-handed'
  | 'reach'
  | 'special';

export type WeaponMode =
  | 'melee'
  | 'ranged';

export interface WeaponItem extends EquipmentBase {
  cost: Money
  category: WeaponCategory;
  mode: WeaponMode;
  range?: { normal: number; long?: number; unit: 'ft' }
  properties: WeaponProperty[];
  damage: { default: string, versatile?: string }
  damageType: string  
  mastery: string
  description?: string
}

export type MagicItemSlot =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'potion'
  | 'ring'
  | 'cloak'
  | 'boots'
  | 'gloves'
  | 'helm'
  | 'belt'
  | 'amulet'
  | 'helm'
  | 'wand'
  | 'staff'
  | 'rod'
  | 'scroll'
  | 'wondrous'

export type MagicItemEffect =
  | { kind: 'bonus'; target: string; value: number }
  | { kind: 'modifier'; target: string; mode: 'add' | 'mul' | 'set'; value: any }
  | { kind: 'note'; text: string };

export type MagicItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very-rare'
  | 'legendary'
  | 'artifact';

export interface MagicItem extends EquipmentBase {
  cost?: Money
  slot: MagicItemSlot;
  // “derived”/composition
  baseItemId?: string;

  consumable?: boolean;

  // flattened “default ruleset” fields (whatever you treat as canonical for now)
  rarity?: MagicItemRarity;
  requiresAttunement?: boolean;

  bonus?: number;
  charges?: number;

  effects?: MagicItemEffect[];

  description?: string;
};

export type EquipmentItem = ArmorItem | WeaponItem | GearItem | MagicItem;