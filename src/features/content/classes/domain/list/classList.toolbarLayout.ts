import type { AppDataGridToolbarLayout } from '@/ui/patterns';

/**
 * Class list toolbar: row 1 — hit die / spellcasting / primary abilities; row 2 — source, visibility, allowed.
 */
export const CLASS_LIST_TOOLBAR_LAYOUT: AppDataGridToolbarLayout = {
  rows: [
    ['hitDie', 'spellcasting', 'primaryAbilities'],
    ['source', 'visibility', 'allowedInCampaign'],
  ],
  utilities: ['hideDisallowed'],
};
