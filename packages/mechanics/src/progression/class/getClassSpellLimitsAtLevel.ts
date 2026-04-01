/**
 * Compute spell limits from a class progression at a given class level.
 *
 * Resolves spell slots and max spell level from the ruleset spellcasting config.
 */
import type { ClassProgression } from '@/features/content/classes/domain/types'
import type { SpellcastingProgression } from '@/shared/types/ruleset'
import { getCantripsFromProfile } from './cantripProgressionProfiles'

// ---------------------------------------------------------------------------
// Casting mode
// ---------------------------------------------------------------------------

/**
 * How a class acquires and manages spells:
 *
 *  - `known`    — fixed list; cast any known spell using a slot
 *                 (Sorcerer, Bard, Ranger)
 *  - `prepared` — choose daily from class list or spellbook
 *                 (Wizard, Cleric, Druid, Paladin)
 *  - `pact`     — known caster with all slots at a single level;
 *                 Mystic Arcanum for higher levels (Warlock)
 *  - `none`     — class has no spellcasting
 */
export type CastingMode = 'known' | 'prepared' | 'pact' | 'none'

// ---------------------------------------------------------------------------
// Limits
// ---------------------------------------------------------------------------

export interface SpellLimits {
  castingMode: CastingMode
  cantrips: number
  totalKnown: number
  maxSpellLevel: number
  slotsByLevel: number[]
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

function deriveCastingMode(prog: ClassProgression): CastingMode {
  const sp = prog.spellProgression
  if (!sp) return 'none'
  if (sp.mysticArcanum) return 'pact'
  return sp.type
}

export function getClassSpellLimitsAtLevel(
  prog: ClassProgression,
  classLevel: number,
  spellcastingConfig: SpellcastingProgression,
): SpellLimits {
  const castingMode = deriveCastingMode(prog)
  const sp = prog.spellProgression
  if (!sp) return { castingMode: 'none', cantrips: 0, totalKnown: 0, maxSpellLevel: 0, slotsByLevel: [] }

  const spellcastingType = prog.spellcasting
  if (
    !spellcastingType ||
    spellcastingType === 'none' ||
    !spellcastingConfig[spellcastingType]
  ) {
    return { castingMode: 'none', cantrips: 0, totalKnown: 0, maxSpellLevel: 0, slotsByLevel: [] }
  }

  const { slotTable, maxSpellLevel } = spellcastingConfig[spellcastingType]!
  const idx = Math.min(classLevel, slotTable.length) - 1
  const cantrips = sp.cantripsKnown
    ? getCantripsFromProfile(sp.cantripsKnown, classLevel)
    : 0
  const totalKnown = sp.spellsKnown?.[idx] ?? 0
  const slots = idx >= 0 ? [...slotTable[idx]] : []

  return { castingMode, cantrips, totalKnown, maxSpellLevel, slotsByLevel: slots }
}
