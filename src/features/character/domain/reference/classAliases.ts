// domain/character/classAliases.ts
// Maps edition-specific class IDs to canonical catalog IDs, and defines 2e class groups.

// ---------------------------------------------------------------------------
// Alias Map
// ---------------------------------------------------------------------------

/**
 * Maps edition-specific class IDs (as listed in editions.ts) to canonical
 * catalog IDs (as used in the classes array). Keeps editions.ts historically
 * accurate while the catalog uses stable, normalized IDs.
 */
export const CLASS_ALIASES: Record<string, string> = {
  // OD&D / Basic — "Fighting Man" and "Magic-User" are the original names
  'fighting-man': 'fighter',
  'magic-user':   'wizard',
  'magicUser':    'wizard',   // legacy catalog ID (BECMI, BX, B, 1e)

  // 2e — "Mage" is the 2e name for the Wizard class
  'mage':         'wizard',
}

/**
 * Resolve an edition-specific class ID to its canonical catalog ID.
 * Returns the original ID if no alias exists.
 */
export function resolveClassId(id: string): string {
  return CLASS_ALIASES[id] ?? id
}

// ---------------------------------------------------------------------------
// 2e Class Groups
// ---------------------------------------------------------------------------

/**
 * AD&D 2nd Edition organizes classes into four groups that share
 * NWP lists, THAC0 tables, and saving throw tables.
 *
 * Keys are group IDs; values are canonical catalog class IDs
 * (post-alias-resolution).
 */
export const CLASS_GROUPS_2E: Record<string, string[]> = {
  warrior: ['fighter', 'paladin', 'ranger'],
  priest:  ['cleric', 'druid'],
  wizard:  ['wizard'],
  rogue:   ['thief', 'bard'],
}

/**
 * Look up the 2e class group for a given canonical class ID.
 * Returns the group key (e.g. 'warrior') or undefined.
 */
export function getClassGroup2e(classId: string): string | undefined {
  for (const [group, members] of Object.entries(CLASS_GROUPS_2E)) {
    if (members.includes(classId)) return group
  }
  return undefined
}
