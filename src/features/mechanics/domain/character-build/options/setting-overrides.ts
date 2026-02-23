/**
 * Setting override rules — pure domain logic.
 *
 * Given a base ID list and an override config, produces the final list.
 * No data lookups; callers provide the inputs.
 *
 * Override priority:
 *  1. `only`  — replaces the entire base list
 *  2. `remove` — filters out IDs from the base list
 *  3. `add`   — appends IDs (deduplicated)
 */
import type { OverrideConfig } from '@/data'

export function applySettingOverrides(
  baseIds: readonly string[],
  overrides: OverrideConfig | undefined,
): string[] {
  let ids = [...baseIds]

  if (!overrides) return ids

  if (overrides.only) {
    return [...overrides.only]
  }

  if (overrides.remove) {
    const removeSet = new Set(overrides.remove)
    ids = ids.filter(id => !removeSet.has(id))
  }

  if (overrides.add) {
    ids = Array.from(new Set([...ids, ...overrides.add]))
  }

  return ids
}
