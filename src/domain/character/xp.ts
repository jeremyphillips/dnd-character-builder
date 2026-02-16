// domain/character/xp.ts
//
// XP-for-level lookups across all D&D editions.
//
// ARCHITECTURE NOTE — Two XP models exist:
//
//   Universal (3e, 3.5e, 4e, 5e):
//     One table applies to every class.  Stored in
//     Edition.progression.experience.
//
//   Class-specific (OD&D, Basic, 1e, 2e):
//     Each class has its own XP curve.  A Fighter at level 5 might need
//     16,000 XP while a Thief at level 5 needs only 10,000.  Stored in
//     Edition.progression.classExperience keyed by canonical class ID.
//
// ALIAS RESOLUTION — Edition data uses historical names ("fighting-man",
// "magic-user", "mage") but XP tables are keyed by canonical IDs
// ("fighter", "wizard").  We resolve aliases before lookup so callers can
// pass either form.
//
// LOOKUP PRIORITY:
//   1. classExperience[resolvedClassId]   (class-specific, if it exists)
//   2. experience                          (universal fallback)
//   3. 0                                   (no data available)

import { editions } from '@/data/editions'
import { getById } from '../lookups'
import type { EditionId, Edition } from '@/data'
import { resolveClassId } from './classAliases'

/**
 * Retrieves the XP required for a specific level in a given edition.
 *
 * @param level     - Target character level (clamped to edition's range)
 * @param editionId - Edition to look up
 * @param classId   - Optional class ID — required for accurate results in
 *                    pre-3e editions where each class has a different XP
 *                    table.  Accepts aliases (e.g. "fighting-man") which
 *                    are resolved internally.  When omitted in a class-
 *                    specific edition, returns 0 (no way to pick a table).
 */
/**
 * Given a total XP amount, returns the highest level the character qualifies
 * for in the given edition.
 *
 * This is the reverse of `getXpByLevelAndEdition`.  It walks the XP
 * thresholds from the top down and returns the first level whose
 * requirement is met.
 *
 * @param xp        - Total experience points
 * @param editionId - Edition to look up
 * @param classId   - Optional class ID — required for pre-3e editions
 *                    where each class has a different XP table.
 */
export const getLevelForXp = (
  xp: number,
  editionId: EditionId,
  classId?: string,
): number => {
  const edition = getById<Edition>(editions, editionId)
  if (!edition?.progression) return 1

  const { progression } = edition
  const maxLevel = progression.maxLevel ?? 20

  // --- Class-specific table (pre-3e editions) ---
  if (progression.classExperience && classId) {
    const canonicalId = resolveClassId(classId)
    const classTable = progression.classExperience[canonicalId]

    if (classTable) {
      // Walk from highest level down to find the first one the XP qualifies for
      for (let lvl = maxLevel; lvl >= 1; lvl--) {
        const entry = classTable.find(e => e.level === lvl)
        if (entry && xp >= entry.xpRequired) return lvl
      }
      return 1
    }
  }

  // --- Universal table (3e+ editions) ---
  if (progression.experience) {
    for (let lvl = maxLevel; lvl >= 1; lvl--) {
      const entry = progression.experience.find(e => e.level === lvl)
      if (entry && xp >= entry.xpRequired) return lvl
    }
  }

  return 1
}

export const getXpByLevelAndEdition = (
  level: number,
  editionId: EditionId,
  classId?: string
): number => {
  const edition = getById<Edition>(editions, editionId)
  if (!edition?.progression) return 0

  const { progression } = edition
  const maxLevel = progression.maxLevel ?? 20
  const targetLevel = Math.min(Math.max(1, level), maxLevel)

  // --- Class-specific table (pre-3e editions) ---
  if (progression.classExperience && classId) {
    const canonicalId = resolveClassId(classId)
    const classTable = progression.classExperience[canonicalId]

    if (classTable) {
      const entry = classTable.find(e => e.level === targetLevel)
      return entry?.xpRequired ?? 0
    }
  }

  // --- Universal table (3e+ editions) ---
  if (progression.experience) {
    const entry = progression.experience.find(e => e.level === targetLevel)
    return entry?.xpRequired ?? 0
  }

  return 0
}
