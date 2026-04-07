import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

type LocationMapEditorTrayScrollColumnProps = {
  children: ReactNode;
  /** Place tray centers option tiles; paint tray stretches domain toggles + lists. */
  alignItems?: 'center' | 'stretch';
  /** MUI `gap` theme spacing (default matches former place tray). */
  gap?: number;
};

/**
 * Shared scrollable column for map editor tool trays (place, paint, draw).
 * Shells own palette data and handlers; this only repeats layout chrome.
 */
export function LocationMapEditorTrayScrollColumn({
  children,
  alignItems = 'center',
  gap = 0.75,
}: LocationMapEditorTrayScrollColumnProps) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap,
        py: 0.5,
        pr: 0.5,
        pl: 0.25,
        alignItems,
        overflow: 'auto',
      }}
    >
      {children}
    </Box>
  );
}
