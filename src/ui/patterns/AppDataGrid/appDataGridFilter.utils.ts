import type { AppDataGridFilter, FilterOption } from './appDataGridFilter.types'

export function getFilterDefault<T>(f: AppDataGridFilter<T>): unknown {
  if (f.defaultValue !== undefined) return f.defaultValue
  switch (f.type) {
    case 'select':
      return f.options[0]?.value ?? ''
    case 'multiSelect':
      return []
    case 'boolean':
      return 'all'
  }
}

function optionLabel(options: FilterOption[], value: string): string | undefined {
  return options.find((o) => o.value === value)?.label
}

/**
 * Default badge text for an active filter value; overridden by `formatActiveChipValue` on the filter when set.
 */
export function formatDefaultActiveChipValue<T>(
  f: AppDataGridFilter<T>,
  value: unknown,
): string {
  switch (f.type) {
    case 'select': {
      const v = String(value ?? '')
      return optionLabel(f.options, v) ?? v
    }
    case 'multiSelect': {
      const selected = (value as string[]) ?? []
      if (selected.length === 0) return ''
      if (selected.length === 1) {
        return optionLabel(f.options, selected[0]!) ?? selected[0]!
      }
      return `${selected.length} selected`
    }
    case 'boolean': {
      const v = value as string
      if (v === 'true') return f.trueLabel ?? 'Yes'
      if (v === 'false') return f.falseLabel ?? 'No'
      return 'All'
    }
  }
}
