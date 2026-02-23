import { spellCatalog } from './spellCatalog'
import { resolveSpellEdition } from './editionResolution'
import type { SpellWithEntry } from './types'

/** Get all spells available to a given class + edition, returns matched spell + its edition entry. */
export function getAvailableSpells(classId: string, edition: string): SpellWithEntry[] {
  const resolved = resolveSpellEdition(edition)
  const results: SpellWithEntry[] = []
  for (const spell of spellCatalog) {
    for (const entry of spell.editions) {
      if (entry.edition === resolved && entry.classes.includes(classId)) {
        results.push({ spell, entry })
        break
      }
    }
  }
  return results
}
