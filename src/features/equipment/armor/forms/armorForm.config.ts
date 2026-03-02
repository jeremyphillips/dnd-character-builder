/**
 * Armor form field configs for AppForm + DynamicFormRenderer.
 * Registry-backed.
 */
import type { FieldConfig } from '@/ui/patterns';
import { buildFieldConfigs } from '@/features/equipment/forms/registry';
import { ARMOR_FORM_FIELDS } from './armorForm.registry';

export type GetArmorFieldConfigsOptions = {
  policyCharacters?: { id: string; name: string }[];
};

/**
 * Returns FieldConfig[] for armor Create/Edit forms.
 */
export const getArmorFieldConfigs = (
  options: GetArmorFieldConfigsOptions = {}
): FieldConfig[] => buildFieldConfigs(ARMOR_FORM_FIELDS, options);
