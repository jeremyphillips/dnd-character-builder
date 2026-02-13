// domain/character/classProgression.ts
// Cross-edition class progression conversions, modeled after monsters.conversions.ts

import { classes } from '@/data'
import type { EditionId } from '@/data'
import type {
  CharacterClass,
  ClassProgression,
  AttackProgression,
  ClassFeature,
} from '@/data/classes/types'
import { getById } from '../lookups'

// ---------------------------------------------------------------------------
// Core Class Progression — edition-agnostic intermediate representation
// ---------------------------------------------------------------------------

export interface CoreClassProgression {
  hitDie: number                        // normalized hit die size (d4=4..d12=12)
  hpPerLevel: number                    // average HP per level (hitDie/2 + 0.5, or flat)
  attackProgression: AttackProgression  // good / average / poor
  primaryAbilities: string[]            // e.g. ['str', 'con']
  armorProficiency: string[]            // e.g. ['all'] or ['light', 'medium']
  weaponProficiency: string[]           // e.g. ['all'] or ['simple']
  savingThrows: string[]                // normalized to 5e-style ability saves
  spellcasting: string                  // 'full' | 'half' | 'third' | 'pact' | 'none'
  features: CoreFeature[]               // class features by level
}

export interface CoreFeature {
  level: number
  name: string
  description?: string
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Get progression entry for a given class + edition */
export function getClassProgression(
  classId?: string,
  edition?: EditionId | string
): ClassProgression | undefined {
  if (!classId || !edition) return undefined
  const cls = getById(classes, classId)
  if (!cls?.progression) return undefined
  return cls.progression.find((p) => p.edition === edition)
}

/** Get all progression entries for a given class */
export function getClassProgressionsByClass(
  classId?: string
): ClassProgression[] {
  if (!classId) return []
  const cls = getById(classes, classId)
  return cls?.progression ?? []
}

// ---------------------------------------------------------------------------
// Edition → Core converters
// ---------------------------------------------------------------------------

function convert5eToCore(prog: ClassProgression): CoreClassProgression {
  return {
    hitDie: prog.hitDie,
    hpPerLevel: Math.floor(prog.hitDie / 2) + 1,
    attackProgression: prog.attackProgression,
    primaryAbilities: prog.primaryAbilities,
    armorProficiency: prog.armorProficiency,
    weaponProficiency: prog.weaponProficiency,
    savingThrows: prog.savingThrows ?? [],
    spellcasting: prog.spellcasting ?? 'none',
    features: (prog.features ?? []).map(featureToCore),
  }
}

function convert4eToCore(prog: ClassProgression): CoreClassProgression {
  // 4e uses flat HP per level; approximate a hit die from hpPerLevel
  const estimatedHitDie = prog.hpPerLevel ? prog.hpPerLevel * 2 : 8

  // Map 4e's Fort/Ref/Will bonuses to closest 5e ability saves
  const savingThrows: string[] = []
  if (prog.fortitudeBonus && prog.fortitudeBonus > 0) savingThrows.push('str', 'con')
  if (prog.reflexBonus && prog.reflexBonus > 0) savingThrows.push('dex')
  if (prog.willBonus && prog.willBonus > 0) savingThrows.push('wis')
  // Keep at most 2 (5e convention)
  const saves = savingThrows.slice(0, 2)

  return {
    hitDie: estimatedHitDie,
    hpPerLevel: prog.hpPerLevel ?? Math.floor(estimatedHitDie / 2) + 1,
    attackProgression: prog.attackProgression,
    primaryAbilities: prog.primaryAbilities,
    armorProficiency: prog.armorProficiency,
    weaponProficiency: prog.weaponProficiency,
    savingThrows: saves,
    spellcasting: prog.powerSource === 'Arcane' || prog.powerSource === 'Divine'
      ? 'full'
      : 'none',
    features: (prog.features ?? []).map(featureToCore),
  }
}

function convert2eToCore(prog: ClassProgression): CoreClassProgression {
  // Map 2e THAC0 progression to attack quality (already done via attackProgression)
  // Map 2e's 5 save categories to best-matching ability saves
  const savingThrows = derive2eSavingThrows(prog)

  return {
    hitDie: prog.hitDie,
    hpPerLevel: Math.floor(prog.hitDie / 2) + 1,
    attackProgression: prog.attackProgression,
    primaryAbilities: prog.primaryAbilities,
    armorProficiency: prog.armorProficiency,
    weaponProficiency: prog.weaponProficiency,
    savingThrows,
    spellcasting: 'none', // will be overridden for casters
    features: (prog.features ?? []).map(featureToCore),
  }
}

function convert1eToCore(prog: ClassProgression): CoreClassProgression {
  // 1e is structurally similar to 2e
  return convert2eToCore(prog)
}

function convertClassicToCore(prog: ClassProgression): CoreClassProgression {
  // BECMI / B/X / OD&D — minimal data, use normalized core fields directly
  return {
    hitDie: prog.hitDie,
    hpPerLevel: Math.floor(prog.hitDie / 2) + 1,
    attackProgression: prog.attackProgression,
    primaryAbilities: prog.primaryAbilities,
    armorProficiency: prog.armorProficiency,
    weaponProficiency: prog.weaponProficiency,
    savingThrows: [],
    spellcasting: 'none',
    features: [],
  }
}

// ---------------------------------------------------------------------------
// Derive 2e saving throw mapping
// ---------------------------------------------------------------------------

/** 
 * Heuristic: look at which 2e save categories are best (lowest values)
 * and map to 5e ability saves.
 * 
 * ppd → con, rsw → wis, pp → con, bw → dex, sp → int/wis
 */
function derive2eSavingThrows(prog: ClassProgression): string[] {
  if (!prog.saves2e) return []

  // Sum each category at level 1 (index 0) — lower is better in 2e
  const categories = [
    { cat: 'ppd', val: prog.saves2e.ppd[0], maps: 'con' },
    { cat: 'rsw', val: prog.saves2e.rsw[0], maps: 'wis' },
    { cat: 'pp', val: prog.saves2e.pp[0], maps: 'str' },
    { cat: 'bw', val: prog.saves2e.bw[0], maps: 'dex' },
    { cat: 'sp', val: prog.saves2e.sp[0], maps: 'int' },
  ]

  // Sort ascending (best saves first) and pick the top 2 unique abilities
  categories.sort((a, b) => a.val - b.val)
  const seen = new Set<string>()
  const saves: string[] = []
  for (const c of categories) {
    if (!seen.has(c.maps)) {
      seen.add(c.maps)
      saves.push(c.maps)
    }
    if (saves.length >= 2) break
  }
  return saves
}

// ---------------------------------------------------------------------------
// Public conversion API
// ---------------------------------------------------------------------------

const CLASSIC_EDITIONS = new Set<string>(['becmi', 'bx', 'b', 'odd'])

/**
 * Convert a class progression entry to the edition-agnostic CoreClassProgression.
 */
export function progressionToCore(prog: ClassProgression): CoreClassProgression {
  const edition = prog.edition as string

  if (edition === '5e') return convert5eToCore(prog)
  if (edition === '4e') return convert4eToCore(prog)
  if (edition === '2e') return convert2eToCore(prog)
  if (edition === '1e') return convert1eToCore(prog)
  if (CLASSIC_EDITIONS.has(edition)) return convertClassicToCore(prog)

  // Fallback: use core fields directly
  return {
    hitDie: prog.hitDie || 8,
    hpPerLevel: prog.hpPerLevel ?? (Math.floor((prog.hitDie || 8) / 2) + 1),
    attackProgression: prog.attackProgression,
    primaryAbilities: prog.primaryAbilities,
    armorProficiency: prog.armorProficiency,
    weaponProficiency: prog.weaponProficiency,
    savingThrows: prog.savingThrows ?? [],
    spellcasting: prog.spellcasting ?? 'none',
    features: (prog.features ?? []).map(featureToCore),
  }
}

/**
 * Convert a class from one edition to the core model.
 * Shorthand for looking up the progression and converting.
 */
export function classToCore(
  classId: string,
  edition: EditionId | string
): CoreClassProgression | undefined {
  const prog = getClassProgression(classId, edition)
  if (!prog) return undefined
  return progressionToCore(prog)
}

/**
 * Compare a class across two editions via their core representations.
 */
export function compareClassAcrossEditions(
  classId: string,
  editionA: EditionId | string,
  editionB: EditionId | string
): { a: CoreClassProgression; b: CoreClassProgression } | undefined {
  const a = classToCore(classId, editionA)
  const b = classToCore(classId, editionB)
  if (!a || !b) return undefined
  return { a, b }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function featureToCore(f: ClassFeature): CoreFeature {
  return { level: f.level, name: f.name, description: f.description }
}
