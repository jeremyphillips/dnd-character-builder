import type { AppDataGridToolbarLayout } from '@/ui/patterns';

/**
 * Race list toolbar: no custom filters — source / visibility / allowed live on the 2nd row (row 1 is search only).
 */
export const RACE_LIST_TOOLBAR_LAYOUT: AppDataGridToolbarLayout = {
  rows: [
    [],
    ['source', 'visibility', 'allowedInCampaign'],
  ],
  utilities: ['hideDisallowed'],
};
