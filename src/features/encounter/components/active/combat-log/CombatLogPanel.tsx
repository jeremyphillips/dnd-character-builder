import { useEffect, useMemo, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'

import type { CombatLogEvent } from '@/features/mechanics/domain/combat'
import { CombatLogEntryGroup } from '@/features/combat/components'
import {
  filterLogByMode,
  groupLogEntries,
  type CombatLogPresentationMode,
} from '../../../domain'
import { toCombatLogEntries } from '../../../helpers/logs'

type CombatLogPanelProps = {
  log: CombatLogEvent[]
}

export function CombatLogPanel({ log }: CombatLogPanelProps) {
  const [mode, setMode] = useState<CombatLogPresentationMode>('compact')
  const scrollRef = useRef<HTMLDivElement>(null)

  const entries = useMemo(() => toCombatLogEntries(log), [log])
  const filtered = useMemo(() => filterLogByMode(entries, mode), [entries, mode])
  const groups = useMemo(() => groupLogEntries(filtered), [filtered])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [groups])

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Combat Log</Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            size="small"
            onChange={(_, next) => next && setMode(next)}
          >
            <ToggleButton value="compact">Compact</ToggleButton>
            <ToggleButton value="normal">Normal</ToggleButton>
            <ToggleButton value="debug">Debug</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box
          ref={scrollRef}
          sx={{ maxHeight: 320, overflowY: 'auto' }}
        >
          {groups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No log entries yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
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
    </Paper>
  )
}
