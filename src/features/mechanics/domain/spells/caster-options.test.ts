import { describe, expect, it } from 'vitest'

import {
  formatCasterOptionSummary,
  parseEnumMultiStored,
  serializeEnumMultiStored,
  type CasterOptionField,
} from './caster-options'

describe('caster-options enum-multi wire format', () => {
  it('parseEnumMultiStored splits comma-separated values', () => {
    expect(parseEnumMultiStored('a, b, c')).toEqual(['a', 'b', 'c'])
    expect(parseEnumMultiStored('')).toEqual([])
    expect(parseEnumMultiStored(undefined)).toEqual([])
  })

  it('serializeEnumMultiStored sorts for stability', () => {
    expect(serializeEnumMultiStored(['z', 'a'])).toBe('a,z')
  })

  it('formatCasterOptionSummary formats enum-multi', () => {
    const fields: CasterOptionField[] = [
      {
        kind: 'enum-multi',
        id: 'tags',
        label: 'Tags',
        options: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
      },
    ]
    const values = { tags: 'b,a' }
    expect(formatCasterOptionSummary(fields, values)).toBe(' (Tags: Alpha, Beta)')
  })
})
