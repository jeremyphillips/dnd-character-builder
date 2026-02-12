export const applyOverrides = <T extends string>(
  base: T[],
  overrides?: {
    only?: T[]
    add?: T[]
    remove?: T[]
  }
): T[] => {
  if (!overrides) return base

  if (overrides.only) {
    return overrides.only
  }

  let result = [...base]

  if (overrides.remove) {
    result = result.filter(v => !overrides.remove!.includes(v))
  }

  if (overrides.add) {
    result = Array.from(new Set([...result, ...overrides.add]))
  }

  return result
}
