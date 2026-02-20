import type { CharacterBuilderState } from '@/features/characterBuilder/types'
import { getClassProgression } from '@/features/character/domain/progession'
import { getSpellLimits } from '@/domain/spells'
import { getAvailableSpells } from '@/domain/spells'

/**
 * Compute per-level spell limits for the given state.
 * Returns { perLevelMax, maxSpellLevel, totalKnown } identical to SpellStep's logic.
 */
export function computeSpellLimits(state: CharacterBuilderState) {
  const perLevelMax = new Map<number, number>()
  let maxSpellLevel = 0
  let totalKnown = 0

  if (!state.edition) return { perLevelMax, maxSpellLevel, totalKnown }

  for (const cls of state.classes) {
    if (!cls.classId) continue
    const prog = getClassProgression(cls.classId, state.edition)
    if (!prog?.spellProgression) continue

    const limits = getSpellLimits(prog, cls.level)
    if (limits.cantrips > 0) {
      perLevelMax.set(0, (perLevelMax.get(0) ?? 0) + limits.cantrips)
    }
    for (let i = 0; i < limits.slotsByLevel.length; i++) {
      const spellLevel = i + 1
      if (limits.slotsByLevel[i] > 0) {
        perLevelMax.set(spellLevel, (perLevelMax.get(spellLevel) ?? 0) + limits.slotsByLevel[i])
      }
    }
    maxSpellLevel = Math.max(maxSpellLevel, limits.maxSpellLevel)
    totalKnown += limits.totalKnown
  }

  return { perLevelMax, maxSpellLevel, totalKnown }
}

/**
 * Build a set of available spell IDs + a level map for a given state.
 */
export function getAvailableSpellsByEditionAndClass(character: CharacterBuilderState) {
  const availableIds = new Set<string>()
  const spellLevelMap = new Map<string, number>()

  if (!character.edition) return { availableIds, spellLevelMap }

  for (const cls of character.classes) {
    if (!cls.classId) continue
    for (const s of getAvailableSpells(cls.classId, character.edition)) {
      availableIds.add(s.spell.id)
      spellLevelMap.set(s.spell.id, s.entry.level)
    }
  }

  return { availableIds, spellLevelMap }
}

