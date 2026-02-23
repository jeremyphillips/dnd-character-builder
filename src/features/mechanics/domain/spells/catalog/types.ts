import type { Spell, SpellEditionEntry } from '@/data/classes/spells'

export interface SpellWithEntry {
  spell: Spell
  entry: SpellEditionEntry
}
