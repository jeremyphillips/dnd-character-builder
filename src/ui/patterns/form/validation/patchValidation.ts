/**
 * Patch-mode field validation: reuses FieldConfig rules (required + validate).
 */
import type { FieldConfig } from '../form.types';

export type PatchFieldErrors = Record<string, string | undefined>;

function isValueMissing(field: FieldConfig, value: unknown): boolean {
  if (value == null) return true;
  if (field.type === 'text' || field.type === 'textarea') {
    return typeof value === 'string' && value.trim() === '';
  }
  if (field.type === 'checkbox') {
    return value !== true;
  }
  if (field.type === 'checkboxGroup') {
    return !Array.isArray(value) || value.length === 0;
  }
  return false;
}

function runValidate(
  validate: (value: unknown) => true | string | Promise<true | string>,
  value: unknown,
): string | undefined {
  const result = validate(value);
  if (result === true) return undefined;
  return result;
}

function runValidateObject(
  validateObj: Record<string, (value: unknown) => true | string | Promise<true | string>>,
  value: unknown,
): string | undefined {
  for (const key of Object.keys(validateObj)) {
    const err = runValidate(validateObj[key], value);
    if (err) return err;
  }
  return undefined;
}

export function validatePatchField(params: {
  field: FieldConfig;
  value: unknown;
}): string | undefined {
  const { field, value } = params;

  if (field.required && isValueMissing(field, value)) {
    return `${field.label} is required`;
  }

  const rules = field.rules;
  if (!rules?.validate) return undefined;

  const validate = rules.validate;
  if (typeof validate === 'function') {
    return runValidate(validate, value);
  }
  if (typeof validate === 'object' && validate !== null) {
    return runValidateObject(
      validate as Record<string, (v: unknown) => true | string | Promise<true | string>>,
      value,
    );
  }
  return undefined;
}
