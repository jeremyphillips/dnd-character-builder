/**
 * Shared form types for Weapon Create/Edit routes.
 */
import type { Visibility } from '@/shared/types';
import type {
  WeaponCategory,
  WeaponMode,
  WeaponProperty,
} from '@/features/content/domain/vocab';

export type WeaponFormValues = {
  name: string;
  description: string;
  imageKey: string;
  accessPolicy: Visibility;
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
