/**
 * Shared form types for Weapon Create/Edit routes.
 */
import type {
  WeaponCategory,
  WeaponMode,
  WeaponProperty,
} from '@/features/content/domain/vocab';
import type { ContentFormValues } from '@/features/content/domain/types';

export type WeaponFormValues = ContentFormValues & {
  category: WeaponCategory | '';
  mode: WeaponMode | '';
  damageDefault: string;
  damageVersatile: string;
  damageType: string;
  mastery: string;
  rangeNormal: string;
  rangeLong: string;
  properties: WeaponProperty[];
};
