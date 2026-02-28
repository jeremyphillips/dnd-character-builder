/**
 * Canonical Magic Item content types.
 *
 * Extends the generic ContentItem interfaces with magic-item-specific fields.
 * The data shape mirrors MagicItem from src/data/equipment but adds
 * content-system metadata (source, accessPolicy, patched).
 *
 * Named MagicItemEntry to avoid collision with the data-layer MagicItem type.
 */
import type { Money } from '@/shared/money/types';
import type { Weight } from '@/shared/weight/types';
import type {
  ContentItem,
  ContentSummary,
  ContentInput,
} from './content.types';
import type {
  MagicItemSlot,
  MagicItemRarity,
  MagicItemEffect,
} from '@/data/equipment/equipment.types';

export interface MagicItemEntry extends ContentItem {
  cost?: Money;
  weight?: Weight;
  slot: MagicItemSlot;
  baseItemId?: string;
  consumable?: boolean;
  rarity?: MagicItemRarity;
  requiresAttunement?: boolean;
  bonus?: number;
  charges?: number;
  effects?: MagicItemEffect[];
}

export interface MagicItemSummary extends ContentSummary {
  slot: MagicItemSlot;
  costCp: number;
  rarity?: MagicItemRarity;
  requiresAttunement: boolean;
}

export interface MagicItemInput extends ContentInput {
  cost?: Money;
  weight?: Weight;
  slot?: MagicItemSlot;
  rarity?: MagicItemRarity;
  requiresAttunement?: boolean;
  effects?: MagicItemEffect[];
}
