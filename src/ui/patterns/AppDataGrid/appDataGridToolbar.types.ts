/**
 * Non-filter toolbar controls (not present in `AppDataGridFilter` registry).
 * They read/write existing filter state only.
 */

/** Boolean toolbar filter for campaign allow/deny (shared with Hide disallowed utility). */
export const APP_DATA_GRID_ALLOWED_IN_CAMPAIGN_FILTER_ID = 'allowedInCampaign' as const

export type AppDataGridToolbarUtility = 'hideDisallowed'

export type AppDataGridToolbarLayout = {
  /** Each inner array is one toolbar row of filter ids (left-to-right). */
  rows: string[][]
  /** Utility controls rendered by `AppDataGrid` (e.g. Hide disallowed → `allowedInCampaign`). */
  utilities?: AppDataGridToolbarUtility[]
}
