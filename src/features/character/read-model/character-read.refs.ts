/**
 * Character read-model reference loaders.
 * Batch-loads reference data for race, class, subclass, proficiencies, equipment.
 */

import { getSystemRaces } from '@/features/mechanics/domain/core/rules/systemCatalog.races'
import { getSystemClasses } from '@/features/mechanics/domain/core/rules/systemCatalog.classes'
import { getSystemSkillProficiencies } from '@/features/mechanics/domain/core/rules/systemCatalog.skillProficiencies'
import { getSystemArmor } from '@/features/mechanics/domain/core/rules/systemCatalog.armor'
import { getSystemWeapons } from '@/features/mechanics/domain/core/rules/systemCatalog.weapons'
import { getSystemGear } from '@/features/mechanics/domain/core/rules/systemCatalog.gear'
import { DEFAULT_SYSTEM_RULESET_ID } from '@/features/mechanics/domain/core/rules/systemIds'
import type { CharacterReadReferences } from './character-read.types'

/** Build lookup maps from system catalog for character read endpoints. */
export function loadCharacterReadReferences(): CharacterReadReferences {
  const races = getSystemRaces(DEFAULT_SYSTEM_RULESET_ID)
  const classes = getSystemClasses(DEFAULT_SYSTEM_RULESET_ID)
  const proficiencies = getSystemSkillProficiencies(DEFAULT_SYSTEM_RULESET_ID)
  const armor = getSystemArmor(DEFAULT_SYSTEM_RULESET_ID)
  const weapons = getSystemWeapons(DEFAULT_SYSTEM_RULESET_ID)
  const gear = getSystemGear(DEFAULT_SYSTEM_RULESET_ID)

  const raceById = new Map<string, { id: string; name: string }>()
  for (const r of races) {
    raceById.set(r.id, { id: r.id, name: r.name })
  }

  const classById = new Map<string, { id: string; name: string }>()
  const subclassById = new Map<string, { id: string; name: string }>()
  for (const c of classes) {
    classById.set(c.id, { id: c.id, name: c.name })
    const opts = c.definitions?.options ?? []
    for (const opt of opts) {
      if (opt.id && opt.name) subclassById.set(opt.id, { id: opt.id, name: opt.name })
    }
  }

  const proficiencyById = new Map<string, { id: string; name: string }>()
  for (const p of proficiencies) {
    proficiencyById.set(p.id, { id: p.id, name: p.name })
  }

  const itemById = new Map<string, { id: string; name: string }>()
  for (const a of armor) {
    itemById.set(a.id, { id: a.id, name: a.name })
  }
  for (const w of weapons) {
    itemById.set(w.id, { id: w.id, name: w.name })
  }
  for (const g of gear) {
    itemById.set(g.id, { id: g.id, name: g.name })
  }

  return {
    raceById,
    classById,
    subclassById,
    proficiencyById,
    itemById,
  }
}
