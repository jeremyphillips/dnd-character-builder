import type { GearSummary } from '@/features/content/domain/types';

/** Gear list row includes allowedInCampaign from controller. */
export type GearListRow = GearSummary & { allowedInCampaign?: boolean };
