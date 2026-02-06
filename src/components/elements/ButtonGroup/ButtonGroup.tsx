import { useEffect } from "react"

export type SelectableOption = {
  id: string
  label: string
  disabled?: boolean
}

type ButtonGroupProps<T extends string | string[] | number> = {
  options: SelectableOption[]
  value?: T
  onChange: (value: T) => void
  multiSelect?: boolean
  autoSelectSingle?: boolean
  size?: 'sm' | 'md'
}

const ButtonGroup = <T extends string | string[] | number>({
  options,
  value,
  onChange,
  multiSelect = false,
  autoSelectSingle = true,
  size = 'md'
}: ButtonGroupProps<T>) => {
  // Auto-select when only one option exists
  useEffect(() => {
    if (!autoSelectSingle) return
    if (options.length !== 1) return

    if (multiSelect) {
      if (Array.isArray(value) && value.length > 0) return
      onChange([options[0].id])
    } else {
      if (value === options[0].id) return
      onChange(options[0].id)
    }
  }, [options, value, multiSelect, autoSelectSingle, onChange])


  const isSelected = (id: string) =>
    multiSelect
      ? Array.isArray(value) && value.includes(id)
      : value === id

  const toggle = (id: string) => {
    if (multiSelect) {
      // Treat value as string[]
      const current = (value || []) as string[];

      onChange(
        current.includes(id)
          ? current.filter(v => v !== id)
          : [...current, id]
      )
    } else {
      // Single select: just set the id
      onChange(id)
    }
  }

  return (
    <div className="button-group">
      {options.map(opt => (
        <button
          key={opt.id}
          disabled={opt.disabled}
          className={`btn-${size} ${isSelected(opt.id) ? 'selected' : ''}`}
          onClick={() => toggle(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default ButtonGroup