import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { AppBadge } from '@/ui/primitives'
import {
  formatLogGroupHeader,
  type GroupedLogEntry,
} from '@/features/mechanics/domain/combat/presentation/combat-log/combat-log'

export type CombatLogEntryGroupProps = {
  group: GroupedLogEntry
  /** When false, `debugDetails` lines are omitted (e.g. compact/normal log modes). Default: true. */
  showDebugDetails?: boolean
}

export function CombatLogEntryGroup({ group, showDebugDetails = true }: CombatLogEntryGroupProps) {
  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 0.75 }}
      >
        <AppBadge
          label={formatLogGroupHeader(group)}
          tone="default"
          variant="outlined"
          size="small"
        />
      </Stack>

      <Stack spacing={0.5}>
        {group.entries.map((entry) => (
          <Box key={entry.id}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: entry.importance === 'headline' ? 600 : 400,
                color: entry.importance === 'debug' ? 'text.disabled' : 'text.primary',
              }}
            >
              {entry.message}
            </Typography>

            {entry.details && entry.details.length > 0 && (
              <Stack spacing={0.25} sx={{ pl: 2, mt: 0.25 }}>
                {entry.details.map((detail, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    color="text.secondary"
                  >
                    {detail}
                  </Typography>
                ))}
              </Stack>
            )}

            {showDebugDetails && entry.debugDetails && entry.debugDetails.length > 0 && (
              <Stack spacing={0.25} sx={{ pl: 2, mt: 0.25 }}>
                {entry.debugDetails.map((detail, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                  >
                    {detail}
                  </Typography>
                ))}
              </Stack>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
