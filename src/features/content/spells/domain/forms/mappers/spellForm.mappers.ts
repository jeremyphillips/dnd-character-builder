/**
 * Pure mappers for Spell form values ↔ domain types.
 * Registry-backed with required-field merging.
 */
import type { Spell, SpellInput } from '@/features/content/spells/domain/types';
import type { SpellFormValues } from '../types/spellForm.types';
import {
  buildToInput,
  buildToFormValues,
  buildDefaultFormValues,
} from '@/features/content/shared/forms/registry';
import { getSpellFormFields, type SpellFormFieldsOptions } from '../registry/spellForm.registry';

export type SpellFormMapperOptions = SpellFormFieldsOptions;

/**
 * Converts a Spell domain object to form values.
 * Pass `classesById` from the campaign catalog so class tags match allowed classes.
 */
export function spellToFormValues(
  spell: Spell,
  options?: SpellFormMapperOptions,
): SpellFormValues {
  const fields = getSpellFormFields(options);
  const defaultFormValues = buildDefaultFormValues(fields);
  const toFormValuesFromItem = buildToFormValues(fields);
  return {
    ...(defaultFormValues as SpellFormValues),
    ...toFormValuesFromItem(spell as Spell & Record<string, unknown>),
  };
}

/**
 * Converts form values to SpellInput for create/update.
 * Fully spec-driven — getSpellFormFields parse rules are the source of truth.
 */
export function toSpellInput(
  values: SpellFormValues,
  options?: SpellFormMapperOptions,
): SpellInput {
  return buildToInput(getSpellFormFields(options))(values) as SpellInput;
}
