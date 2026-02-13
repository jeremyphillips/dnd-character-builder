import { spells as spellCatalog } from '@/data/classes/spells'
import type { Spell, SpellEditionEntry } from '@/data/classes/spells'
import type { ClassProgression } from '@/data/classes/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpellWithEntry {
  spell: Spell
  entry: SpellEditionEntry
}

export interface SpellLimits {
  cantrips: number
  totalKnown: number
  maxSpellLevel: number
  slotsByLevel: number[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all spells available to a given class + edition, returns matched spell + its edition entry. */
export function getAvailableSpells(classId: string, edition: string): SpellWithEntry[] {
  const results: SpellWithEntry[] = []
  for (const spell of spellCatalog) {
    for (const entry of spell.editions) {
      if (entry.edition === edition && entry.classes.includes(classId)) {
        results.push({ spell, entry })
        break // one match per spell is enough
      }
    }
  }
  return results
}

/** Group spells by level, sorted ascending. */
export function groupSpellsByLevel(spells: SpellWithEntry[]): Map<number, SpellWithEntry[]> {
  const groups = new Map<number, SpellWithEntry[]>()
  for (const s of spells) {
    const level = s.entry.level
    if (!groups.has(level)) groups.set(level, [])
    groups.get(level)!.push(s)
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a - b))
}

/** Compute spell limits from a class progression at a given class level. */
export function getSpellLimits(prog: ClassProgression, classLevel: number): SpellLimits {
  const sp = prog.spellProgression
  if (!sp) return { cantrips: 0, totalKnown: 0, maxSpellLevel: 0, slotsByLevel: [] }

  const idx = Math.min(classLevel, sp.spellSlots.length) - 1
  const cantrips = sp.cantripsKnown?.[idx] ?? 0
  const totalKnown = sp.spellsKnown?.[idx] ?? 0
  const slots = idx >= 0 ? sp.spellSlots[idx] : []
  const maxSpellLevel = sp.maxSpellLevel

  return { cantrips, totalKnown, maxSpellLevel, slotsByLevel: slots }
}
