import { describe, expect, it } from 'vitest'
import { collectClassEffects } from './collectCharacterEffects'
import type { Character } from '@/features/character/domain/types'

function makeCharacter(classes: Character['classes']): Character {
  return {
    name: 'Test Character',
    type: 'pc',
    classes,
    xp: 0,
    totalLevel: classes.reduce((sum, cls) => sum + cls.level, 0),
  }
}

describe('collectClassEffects', () => {
  it('keeps activated subclass effects nested instead of flattening them', () => {
    const character = makeCharacter([
      {
        classId: 'paladin',
        subclassId: 'oath_of_devotion',
        level: 7,
      },
    ])

    const effects = collectClassEffects(character)

    expect(effects).toContainEqual(
      expect.objectContaining({
        kind: 'activation',
        activation: 'action',
      }),
    )

    expect(effects).not.toContainEqual(
      expect.objectContaining({
        kind: 'modifier',
        target: 'attack_roll',
      }),
    )
  })
})
