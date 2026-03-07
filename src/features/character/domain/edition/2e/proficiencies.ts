/**
 * Combines the General skills with a specific Class group
 * and returns an array of just the IDs (keys).
 */

export const resolveAvailable2eSkills = (
  generalGroup: Record<string, unknown>,
  classSpecificGroup: Record<string, unknown>,
): string[] => {
  return [
    ...Object.keys(generalGroup),
    ...Object.keys(classSpecificGroup),
  ]
}