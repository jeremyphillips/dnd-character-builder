/**
 * Canonical Weapon content types.
 *
 * Extends the generic ContentItem interfaces with weapon-specific fields.
 * The data shape mirrors WeaponItem from src/data/equipment but adds
 * content-system metadata (source, accessPolicy, patched).
 */
import type { Money } from '@/shared/money/types';
import type { Weight } from '@/shared/weight/types';
import type {
  ContentItem,
  ContentSummary,
  ContentInput,
} from './content.types';
import type {
  WeaponCategory,
  WeaponMode,
  WeaponProperty,
} from '@/data/equipment/equipment.types';

export interface Weapon extends ContentItem {
  cost: Money;
  weight?: Weight;
  category: WeaponCategory;
  mode: WeaponMode;
  range?: { normal: number; long?: number; unit: 'ft' };
  properties: WeaponProperty[];
  damage: { default: string; versatile?: string };
  damageType: string;
  mastery: string;
}

export interface WeaponSummary extends ContentSummary {
  category: WeaponCategory;
  costCp: number;
  damage: string;
  damageType: string;
  properties: WeaponProperty[];
}

export interface WeaponInput extends ContentInput {
  cost?: Money;
  weight?: Weight;
  category?: WeaponCategory;
  mode?: WeaponMode;
  range?: { normal: number; long?: number; unit: 'ft' };
  properties?: WeaponProperty[];
  damage?: { default: string; versatile?: string };
  damageType?: string;
  mastery?: string;
}
