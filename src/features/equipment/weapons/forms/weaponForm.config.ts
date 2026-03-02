/**
 * Weapon form field configs for AppForm + DynamicFormRenderer.
 */
import type { FieldConfig } from '@/ui/patterns';
import { baseEquipmentFieldConfigs } from '@/features/equipment/forms';
import {
  WEAPON_CATEGORY_OPTIONS,
  WEAPON_MODE_OPTIONS,
  WEAPON_PROPERTY_OPTIONS,
  WEAPON_DAMAGE_TYPE_OPTIONS,
} from '@/features/content/domain/vocab';

export type GetWeaponFieldConfigsOptions = {
  policyCharacters?: { id: string; name: string }[];
  includeAccessPolicy?: boolean;
};

/**
 * Returns FieldConfig[] for weapon Create/Edit forms.
 * Combines base equipment fields with weapon-specific fields.
 */
export const getWeaponFieldConfigs = (
  options: GetWeaponFieldConfigsOptions = {}
): FieldConfig[] => {
  const { policyCharacters = [], includeAccessPolicy = false } = options;

  const base = baseEquipmentFieldConfigs({
    includeDescription: true,
    includeImageKey: true,
    includeAccessPolicy,
    policyCharacters,
  });

  const weaponFields: FieldConfig[] = [
    {
      type: 'select',
      name: 'category',
      label: 'Category',
      options: WEAPON_CATEGORY_OPTIONS.map(({ value, label }) => ({ value, label })),
      placeholder: 'Select category',
    },
    {
      type: 'select',
      name: 'mode',
      label: 'Mode',
      options: WEAPON_MODE_OPTIONS.map(({ value, label }) => ({ value, label })),
      placeholder: 'Select mode',
    },
    {
      type: 'text',
      name: 'damageDefault',
      label: 'Damage (e.g. 1d6)',
      placeholder: '1d6',
    },
    {
      type: 'text',
      name: 'damageVersatile',
      label: 'Damage (versatile)',
      placeholder: '1d8',
      helperText: 'Optional. Only used for versatile weapons.',
    },
    {
      type: 'select',
      name: 'damageType',
      label: 'Damage Type',
      options: WEAPON_DAMAGE_TYPE_OPTIONS.map(({ value, label }) => ({ value, label })),
      placeholder: 'Select damage type',
    },
    {
      type: 'text',
      name: 'mastery',
      label: 'Mastery',
      placeholder: 'e.g. slow, nick',
    },
    {
      type: 'text',
      name: 'rangeNormal',
      label: 'Range (normal, ft)',
      inputType: 'number',
      placeholder: 'e.g. 30',
      helperText: 'Only used for ranged weapons.',
    },
    {
      type: 'text',
      name: 'rangeLong',
      label: 'Range (long, ft)',
      inputType: 'number',
      placeholder: 'e.g. 120',
      helperText: 'Optional. Only used for ranged weapons.',
    },
    {
      type: 'checkboxGroup',
      name: 'properties',
      label: 'Properties',
      options: WEAPON_PROPERTY_OPTIONS.map(({ value, label }) => ({ value, label })),
      row: true,
    },
  ];

  return [...base, ...weaponFields];
};
