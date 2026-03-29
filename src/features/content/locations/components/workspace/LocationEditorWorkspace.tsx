import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import { LOCATION_EDITOR_HEADER_HEIGHT_PX } from './locationEditor.constants'

type LocationEditorWorkspaceProps = {
  header: ReactNode
  canvas: ReactNode
  rightRail: ReactNode
}

export function LocationEditorWorkspace({
  header,
  canvas,
  rightRail,
}: LocationEditorWorkspaceProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {header}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          maxHeight: `calc(100vh - ${LOCATION_EDITOR_HEADER_HEIGHT_PX}px)`,
        }}
      >
        {canvas}
        {rightRail}
      </Box>
    </Box>
  )
}
