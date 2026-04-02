import { describe, expect, it } from 'vitest'

import type { EncounterState } from '@/features/mechanics/domain/combat'

import { inferPlayerCharacterIdFromEncounterOwnership } from '../infer-player-character-from-encounter'

describe('inferPlayerCharacterIdFromEncounterOwnership', () => {
  const encounter = {
    combatantsById: {
      p1: {
        instanceId: 'p1',
        side: 'party',
        source: { kind: 'pc' as const, sourceId: 'char-rogue', label: 'Rogue' },
      },
    },
  } as unknown as EncounterState

  it('returns character id when user owns a party PC in the encounter', () => {
    expect(
      inferPlayerCharacterIdFromEncounterOwnership('user-a', encounter, [
        { id: 'char-rogue', ownerUserId: 'user-a' },
        { id: 'other', ownerUserId: 'user-b' },
      ]),
    ).toBe('char-rogue')
  })

  it('returns null when user owns no character in the encounter', () => {
    expect(
      inferPlayerCharacterIdFromEncounterOwnership('user-c', encounter, [
        { id: 'char-rogue', ownerUserId: 'user-a' },
      ]),
    ).toBe(null)
  })
})
