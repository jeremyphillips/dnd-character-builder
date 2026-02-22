/**
 * @deprecated All exports have moved to '@/features/mechanics/domain/spells'.
 *
 * - getAvailableSpells → '@/features/mechanics/domain/spells/catalog'
 * - groupSpellsByLevel → '@/features/mechanics/domain/spells/utils/groupSpellsByLevel'
 * - SpellWithEntry     → '@/features/mechanics/domain/spells/catalog/types'
 * - getSpellLimits     → getClassSpellLimitsAtLevel from '@/features/mechanics/domain/spells/progression'
 */
import { spells as spellCatalog } from '@/data/classes/spells'
import type { Spell, SpellEditionEntry } from '@/data/classes/spells'
import type { ClassProgression } from '@/data/classes/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** @deprecated Import from '@/features/mechanics/domain/spells' instead. */
export interface SpellWithEntry {
  spell: Spell
  entry: SpellEditionEntry
}

/** @deprecated Import SpellLimits from '@/features/mechanics/domain/spells/progression' instead. */
export interface SpellLimits {
  cantrips: number
  totalKnown: number
  maxSpellLevel: number
  slotsByLevel: number[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** @deprecated Use getAvailableSpells from '@/features/mechanics/domain/spells' instead. */
export function getAvailableSpells(classId: string, edition: string): SpellWithEntry[] {
  const results: SpellWithEntry[] = []
  for (const spell of spellCatalog) {
    for (const entry of spell.editions) {
      if (entry.edition === edition && entry.classes.includes(classId)) {
        results.push({ spell, entry })
        break
      }
    }
  }
  return results
}

/** @deprecated Use groupSpellsByLevel from '@/features/mechanics/domain/spells' instead. */
export function groupSpellsByLevel(spells: SpellWithEntry[]): Map<number, SpellWithEntry[]> {
  const groups = new Map<number, SpellWithEntry[]>()
  for (const s of spells) {
    const level = s.entry.level
    if (!groups.has(level)) groups.set(level, [])
    groups.get(level)!.push(s)
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a - b))
}

/**
 * @deprecated Use getClassSpellLimitsAtLevel from
 * '@/features/mechanics/domain/spells/progression' instead.
 */
export function getSpellLimits(prog: ClassProgression, classLevel: number): SpellLimits {
  const sp = prog.spellProgression
  if (!sp) return { cantrips: 0, totalKnown: 0, maxSpellLevel: 0, slotsByLevel: [] }

  const idx = Math.min(classLevel, sp.spellSlots.length) - 1
  const cantrips = sp.cantripsKnown?.[idx] ?? 0
  const totalKnown = sp.spellsKnown?.[idx] ?? 0
  const slots = idx >= 0 ? sp.spellSlots[idx] : []

  let maxSpellLevel = 0
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i] > 0) {
      maxSpellLevel = i + 1
      break
    }
  }

  return { cantrips, totalKnown, maxSpellLevel, slotsByLevel: slots }
}
