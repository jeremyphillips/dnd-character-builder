import type { SpellSummary } from '../repo/spellRepo';

/** Spell list row includes allowedInCampaign from controller. */
export type SpellListRow = SpellSummary & { allowedInCampaign?: boolean };
