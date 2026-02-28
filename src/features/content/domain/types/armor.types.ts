/**
 * Canonical Armor content types.
 *
 * Extends the generic ContentItem interfaces with armor-specific fields.
 * The data shape mirrors ArmorItem from src/data/equipment but adds
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
  ArmorCategory,
  Material,
} from '@/data/equipment/equipment.types';

export interface Armor extends ContentItem {
  cost: Money;
  weight?: Weight;
  category: ArmorCategory;
  material: Material;
  baseAC?: number;
  dex?: { mode: 'full' } | { mode: 'capped'; maxBonus: number } | { mode: 'none' };
  stealthDisadvantage?: boolean;
  minStrength?: number;
  acBonus?: number;
}

export interface ArmorSummary extends ContentSummary {
  category: ArmorCategory;
  costCp: number;
  baseAC?: number;
  acBonus?: number;
  stealthDisadvantage: boolean;
}

export interface ArmorInput extends ContentInput {
  cost?: Money;
  weight?: Weight;
  category?: ArmorCategory;
  material?: Material;
  baseAC?: number;
  dex?: { mode: 'full' } | { mode: 'capped'; maxBonus: number } | { mode: 'none' };
  stealthDisadvantage?: boolean;
  minStrength?: number;
  acBonus?: number;
}
