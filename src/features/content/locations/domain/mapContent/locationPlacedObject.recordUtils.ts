/**
 * Small typed helpers for deriving records from the authored placed-object registry
 * without repeating keys or widening to `string`.
 */

/** Keys of `obj` as an array, preserving `keyof T` (unlike `Object.keys` → `string[]`). */
export function recordKeys<T extends Record<PropertyKey, unknown>>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/** Build `{ [K in keyof T]: V }` from each entry of `obj` — no manual key list. */
export function mapValuesStrict<T extends Record<PropertyKey, unknown>, V>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => V,
): { [K in keyof T]: V } {
  const keys = recordKeys(obj);
  const out = {} as { [K in keyof T]: V };
  for (const k of keys) {
    out[k] = fn(obj[k], k);
  }
  return out;
}
