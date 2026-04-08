/**
 * Static layout tokens for the location editor workspace shell (header, rails, map tool column).
 * For map feature drawing (regions, paths, edges), see `locationMapUiStyles`.
 */
export const locationEditorWorkspaceUiTokens = {
  headerHeightPx: 64,
  rightRailWidthPx: 380,
  mapToolbarWidthPx: 50,
  /** Unified width for paint / draw tool palettes beside the map toolbar. */
  mapToolTrayWidthPx: 200,
} as const;

export type LocationEditorWorkspaceUiTokens = typeof locationEditorWorkspaceUiTokens;

/**
 * Horizontal space reserved for the left map chrome in grid layout math (`leftChromeWidthPx`).
 *
 * When the map editor chrome is shown, always reserve **toolbar + tool tray** width so
 * `useLocationAuthoringGridLayout` does not reflow when switching into paint/draw (trays overlay
 * the canvas; grid math should stay stable across modes).
 */
export function resolveLeftMapChromeWidthPx(args: { showMapEditorChrome: boolean }): number {
  const { mapToolbarWidthPx, mapToolTrayWidthPx } = locationEditorWorkspaceUiTokens;
  if (!args.showMapEditorChrome) return 0;
  return mapToolbarWidthPx + mapToolTrayWidthPx;
}
