/**
 * Shared form types for Armor Create/Edit routes.
 */
import type { Visibility } from '@/shared/types';
import type { ArmorCategory, Material } from '@/features/content/domain/vocab';

export type ArmorFormValues = {
  name: string;
  description: string;
  imageKey: string;
  accessPolicy: Visibility;
  category: ArmorCategory | '';
  material: Material | '';
  baseAC: string;
  acBonus: string;
  stealthDisadvantage: boolean;
};
