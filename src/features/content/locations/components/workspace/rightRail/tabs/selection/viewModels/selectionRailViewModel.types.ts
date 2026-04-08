/** Key/value row for `SelectionMetadataRows` (see Selection rail template). */
export type PresentationMetadataRow = { label: string; value: string };

/**
 * Shared header + metadata rows for Selection rail view-model builders (cell fill, optional future branches).
 * Inspectors may still compose {@link SelectionRailTemplate} inline without a builder.
 */
export type SelectionRailViewModel = {
  categoryLabel: string;
  title: string;
  placementLine: string;
  metadataRows: PresentationMetadataRow[];
};

/** Cell-fill branch — alias of {@link SelectionRailViewModel}. */
export type CellFillSelectionRailViewModel = SelectionRailViewModel;
