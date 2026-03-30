import type { ReactNode } from 'react'
import Box from '@mui/material/Box'

import { AppTabs, AppTab } from '@/ui/patterns'

export type LocationEditorMapRailTabsProps = {
  metadata: ReactNode
  /** 0 = Metadata, 1 = Cell */
  tabIndex: number
  onTabChange: (index: number) => void
  cellPanel: ReactNode
}

export function LocationEditorMapRailTabs({
  metadata,
  tabIndex,
  onTabChange,
  cellPanel,
}: LocationEditorMapRailTabsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <AppTabs
        value={tabIndex}
        onChange={(_e, v) => onTabChange(v as number)}
        variant="fullWidth"
        sx={{ flexShrink: 0 }}
      >
        <AppTab label="Metadata" />
        <AppTab label="Cell" />
      </AppTabs>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2.5 }}>
        {tabIndex === 0 ? metadata : cellPanel}
      </Box>
    </Box>
  )
}
