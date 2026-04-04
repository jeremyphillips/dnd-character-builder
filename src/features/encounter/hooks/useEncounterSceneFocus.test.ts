import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DEFAULT_SCENE_FOCUS, useEncounterSceneFocus } from './useEncounterSceneFocus'

describe('useEncounterSceneFocus', () => {
  it('initializes to followEncounterSpace', () => {
    const { result } = renderHook(() => useEncounterSceneFocus())
    expect(result.current[0]).toEqual(DEFAULT_SCENE_FOCUS)
  })
})
