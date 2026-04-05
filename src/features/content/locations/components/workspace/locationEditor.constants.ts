import { locationEditorWorkspaceUiTokens } from '@/features/content/locations/domain/mapPresentation/locationEditorWorkspaceUiTokens';

export { locationEditorWorkspaceUiTokens, resolveLeftMapChromeWidthPx } from '@/features/content/locations/domain/mapPresentation/locationEditorWorkspaceUiTokens';

const t = locationEditorWorkspaceUiTokens;

export const LOCATION_EDITOR_HEADER_HEIGHT_PX = t.headerHeightPx;
export const LOCATION_EDITOR_RIGHT_RAIL_WIDTH_PX = t.rightRailWidthPx;
export const LOCATION_EDITOR_TOOLBAR_WIDTH_PX = t.mapToolbarWidthPx;
/** @deprecated Prefer `locationEditorWorkspaceUiTokens.mapToolTrayWidthPx` — paint and draw share one tray width. */
export const LOCATION_EDITOR_PAINT_TRAY_WIDTH_PX = t.mapToolTrayWidthPx;
/** @deprecated Prefer `locationEditorWorkspaceUiTokens.mapToolTrayWidthPx`. */
export const LOCATION_EDITOR_DRAW_TRAY_WIDTH_PX = t.mapToolTrayWidthPx;
