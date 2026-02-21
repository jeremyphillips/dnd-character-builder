/**
 * Combines the General skills with a specific Class group 
 * and returns an array of just the IDs (keys).
 */

export const resolveAvailable2eSkills = (generalGroup, classSpecificGroup: Record<string, Skill>) => {
  return [
    ...Object.keys(generalGroup),
    ...Object.keys(classSpecificGroup)
  ];
}