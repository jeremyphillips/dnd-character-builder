/**
 * Spell form field configs for AppForm + DynamicFormRenderer.
 * Registry-backed.
 */
import type { FieldConfig } from '@/ui/patterns';
import { buildDefaultValues } from '@/ui/patterns';
import { buildFieldConfigs } from '@/features/content/forms/registry';
import { SPELL_FORM_FIELDS } from './spellForm.registry';
import type { SpellFormValues } from './spellForm.types';

export type GetSpellFieldConfigsOptions = {
  policyCharacters?: { id: string; name: string }[];
};

/**
 * Returns FieldConfig[] for spell Create/Edit forms.
 */
export const getSpellFieldConfigs = (
  options: GetSpellFieldConfigsOptions = {}
): FieldConfig[] => buildFieldConfigs(SPELL_FORM_FIELDS, options);

/**
 * Default values for spell forms (RHF defaultValues).
 * Derived from field configs.
 */
export const SPELL_FORM_DEFAULTS: SpellFormValues = buildDefaultValues<SpellFormValues>(
  getSpellFieldConfigs()
);
