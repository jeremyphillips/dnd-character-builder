import { describe, expect, it } from 'vitest'
import { getAbilityScoreValue, resolveAbilityScoreMap } from './abilityScoreMap'

describe('getAbilityScoreValue', () => {
  it('returns default when map is missing', () => {
    expect(getAbilityScoreValue(undefined, 'dex')).toBe(10)
    expect(getAbilityScoreValue(null, 'str', 8)).toBe(8)
  })

  it('reads short id', () => {
    expect(getAbilityScoreValue({ dex: 16 }, 'dex')).toBe(16)
  })

  it('reads full key when id absent', () => {
    expect(getAbilityScoreValue({ dexterity: 14 }, 'dex')).toBe(14)
  })

  it('prefers id when both present', () => {
    expect(
      getAbilityScoreValue({ dex: 20, dexterity: 12 }, 'dex'),
    ).toBe(20)
  })
})

describe('resolveAbilityScoreMap', () => {
  it('fills all keys with defaults from mixed id-only map', () => {
    const r = resolveAbilityScoreMap({ dex: 18, str: 12 })
    expect(r.dexterity).toBe(18)
    expect(r.strength).toBe(12)
    expect(r.charisma).toBe(10)
  })

  it('accepts key-shaped map', () => {
    const r = resolveAbilityScoreMap({
      strength: 8,
      dexterity: 16,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 8,
    })
    expect(r.dexterity).toBe(16)
  })
})
