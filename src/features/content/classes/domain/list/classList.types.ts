import type { ClassSummary } from '../repo/classRepo';

/** Class list row includes allowedInCampaign from controller. */
export type ClassListRow = ClassSummary & { allowedInCampaign?: boolean };
