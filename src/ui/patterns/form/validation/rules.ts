/**
 * Validation rule helpers for FieldSpec validation.
 */

export type ValidationRule =
  | { kind: 'min'; value: number; message?: string }
  | { kind: 'max'; value: number; message?: string }
  | { kind: 'integer'; message?: string }
  | { kind: 'pattern'; value: RegExp; message?: string }
  | { kind: 'minLength'; value: number; message?: string }
  | { kind: 'maxLength'; value: number; message?: string };

export type ValidationSpec = {
  rules: ValidationRule[];
};

/**
 * Returns a ValidationSpec with min/max (and optional integer) rules.
 */
export function numberRange(
  min: number,
  max: number,
  opts?: { integer?: boolean; message?: string },
): ValidationSpec {
  const rangeMessage = opts?.message ?? `Must be between ${min} and ${max}`;
  const rules: ValidationRule[] = [
    { kind: 'min', value: min, message: rangeMessage },
    { kind: 'max', value: max, message: rangeMessage },
  ];
  if (opts?.integer) {
    rules.push({ kind: 'integer', message: opts?.message ?? 'Must be a whole number' });
  }
  return { rules };
}
