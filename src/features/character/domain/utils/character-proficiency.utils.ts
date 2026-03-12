import type { CharacterProficiencies, SkillAdjustment } from '@/features/character/domain/types'

/**
 * Extract skill IDs from proficiencies (record shape or legacy array).
 * Returns empty array for undefined or empty skills.
 */
export function getSkillIds(proficiencies: { skills?: string[] | Record<string, SkillAdjustment> } | undefined): string[] {
  const skills = proficiencies?.skills
  if (!skills) return []
  if (Array.isArray(skills)) return skills
  if (typeof skills !== 'object') return []
  return Object.keys(skills)
}

/**
 * Convert array of skill IDs to record shape with proficiencyLevel: 1 per entry.
 */
export function toSkillProficienciesRecord(ids: string[]): Record<string, SkillAdjustment> {
  return Object.fromEntries(ids.map((id) => [id, { proficiencyLevel: 1 }]))
}
