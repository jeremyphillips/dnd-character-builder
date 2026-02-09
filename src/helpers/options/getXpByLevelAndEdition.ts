import { editions } from "@/data/editions"
import { getById } from "@/helpers"
import type { EditionId, Edition } from "@/data"

/**
 * Retrieves the XP required for a specific level by looking up the Edition by ID.
 */
export const getXpByLevelAndEdition = (level: number, editionId: EditionId): number => {
  const edition = getById<Edition>(editions, editionId);

  // if edition doesn't exist, return 0
  if (!edition || !edition.progression) return 0;

  const { progression } = edition;

  // Clamp level to the min/max allowed for this edition
  const targetLevel = Math.min(Math.max(1, level), progression.maxLevel);

  // Find the level data within experience array
  const levelData = progression.experience.find((e) => e.level === targetLevel);

  return levelData ? levelData.xpRequired : 0;
};
