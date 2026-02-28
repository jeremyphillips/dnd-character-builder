/**
 * Canonical Gear content types.
 *
 * Extends the generic ContentItem interfaces with gear-specific fields.
 * The data shape mirrors GearItem from src/data/equipment but adds
 * content-system metadata (source, accessPolicy, patched).
 */
import type { Money } from '@/shared/money/types';
import type { Weight } from '@/shared/weight/types';
import type {
  ContentItem,
  ContentSummary,
  ContentInput,
} from './content.types';
import type { GearCategory } from '@/data/equipment/equipment.types';

export interface Gear extends ContentItem {
  cost: Money;
  weight?: Weight;
  category: GearCategory;
  capacity?: string;
  range?: string;
  duration?: string;
  hp?: number;
  burstDC?: number;
  charges?: number;
  pages?: number;
  type?: string;
  effect?: string;
  proficiency?: string;
  kind?: string;
}

export interface GearSummary extends ContentSummary {
  category: GearCategory;
  costCp: number;
  weightLb: number;
}

export interface GearInput extends ContentInput {
  cost?: Money;
  weight?: Weight;
  category?: GearCategory;
  capacity?: string;
}
