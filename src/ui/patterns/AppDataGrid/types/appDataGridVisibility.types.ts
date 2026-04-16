/**
 * Optional viewer visibility rules for AppDataGrid schema items.
 * Omit `visibility` so everyone sees the item.
 */
export type AppDataGridVisibility = {
  /** If true, show this item only when `viewer.isPlatformAdmin` is true. */
  platformAdminOnly?: boolean
}

/** @deprecated Use `AppDataGridVisibility` instead. */
export type AppDataGridFilterVisibility = AppDataGridVisibility
