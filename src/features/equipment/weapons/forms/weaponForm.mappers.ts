/**
 * Pure mappers for Weapon form values ↔ domain types.
 */
import { DEFAULT_VISIBILITY_PUBLIC } from '@/ui/patterns';
import type { Weapon, WeaponInput } from '@/features/content/domain/types';
import type { WeaponFormValues } from './weaponForm.types';

export const toOptionalNumber = (s: string): number | undefined => {
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

export const trimOrNull = (s: string): string | null =>
  s.trim() ? s.trim() : null;

/**
 * Converts a Weapon domain object to form values.
 */
export const weaponToFormValues = (weapon: Weapon): WeaponFormValues => ({
  name: weapon.name,
  description: weapon.description ?? '',
  imageKey: weapon.imageKey ?? '',
  accessPolicy: weapon.accessPolicy ?? DEFAULT_VISIBILITY_PUBLIC,
  category: weapon.category ?? '',
  mode: weapon.mode ?? '',
  damageDefault: weapon.damage?.default ?? '',
  damageVersatile: weapon.damage?.versatile ?? '',
  damageType: weapon.damageType ?? '',
  mastery: (weapon as { mastery?: string }).mastery ?? '',
  rangeNormal:
    weapon.range?.normal != null ? String(weapon.range.normal) : '',
  rangeLong:
    weapon.range?.long != null ? String(weapon.range.long) : '',
  properties: weapon.properties ?? [],
});

/**
 * Converts form values to WeaponInput for create/update.
 */
export const toWeaponInput = (values: WeaponFormValues): WeaponInput => {
  const damage: { default: string; versatile?: string } = {
    default: values.damageDefault.trim(),
  };
  if (values.damageVersatile.trim()) {
    damage.versatile = values.damageVersatile.trim();
  }

  let range: { normal: number; long?: number; unit: 'ft' } | undefined;
  if (values.mode === 'ranged') {
    const normal = toOptionalNumber(values.rangeNormal);
    if (normal != null) {
      const long = toOptionalNumber(values.rangeLong);
      range = {
        normal,
        ...(long != null && { long }),
        unit: 'ft',
      };
    }
  }

  const input: WeaponInput = {
    name: values.name.trim(),
    description: values.description.trim(),
    imageKey: trimOrNull(values.imageKey),
    accessPolicy: values.accessPolicy,
    category: values.category
      ? (values.category as WeaponInput['category'])
      : undefined,
    mode: values.mode ? (values.mode as WeaponInput['mode']) : undefined,
    damage,
    damageType: values.damageType.trim() || undefined,
    properties: values.properties,
    ...(range && { range }),
  };

  if (values.mastery.trim()) {
    (input as WeaponInput & { mastery?: string }).mastery =
      values.mastery.trim();
  }

  return input;
};
