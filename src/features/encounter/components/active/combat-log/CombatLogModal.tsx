import { useEffect, useMemo, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'

import { AppModal } from '@/ui/patterns'
import type { CombatLogEvent } from '@/features/mechanics/domain/combat'
import { CombatLogEntryGroup } from '@/features/combat/components'
import {
  filterLogByMode,
  groupLogEntries,
  type CombatLogPresentationMode,
} from '../../../domain'
import { toCombatLogEntries } from '../../../helpers/logs'

type CombatLogModalProps = {
  open: boolean
  onClose: () => void
  log: CombatLogEvent[]
}

export function CombatLogModal({ open, onClose, log }: CombatLogModalProps) {
  const [mode, setMode] = useState<CombatLogPresentationMode>('normal')
  const scrollRef = useRef<HTMLDivElement>(null)

  const entries = useMemo(() => toCombatLogEntries(log), [log])
  const filtered = useMemo(() => filterLogByMode(entries, mode), [entries, mode])
  const groups = useMemo(() => groupLogEntries(filtered), [filtered])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [groups])

  return (
    <AppModal
      open={open}
      onClose={onClose}
      headline="Combat Log"
      size="wide"
      secondaryAction={{ label: 'Close', onClick: onClose }}
    >
      <Stack spacing={2}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          size="small"
          onChange={(_, next) => next && setMode(next)}
        >
          <ToggleButton value="compact">Headline</ToggleButton>
          <ToggleButton value="normal">Detail</ToggleButton>
          <ToggleButton value="debug">Debug</ToggleButton>
        </ToggleButtonGroup>

        <Box
          ref={scrollRef}
          sx={{ maxHeight: '60vh', overflowY: 'auto' }}
        >
          {groups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No log entries yet.</Typography>
          ) : (
            <Stack spacing={2}>
              {groups.map((group) => (
                <CombatLogEntryGroup
                  key={group.groupKey}
                  group={group}
                  showDebugDetails={mode === 'debug'}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </AppModal>
  )
}
