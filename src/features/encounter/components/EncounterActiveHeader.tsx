import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import { AppBadge } from '@/ui/primitives'

type EncounterActiveHeaderProps = {
  roundNumber: number
  turnIndex: number
  activeCombatantLabel: string | null
  onNextTurn: () => void
  onResetEncounter: () => void
}

export function EncounterActiveHeader({
  roundNumber,
  turnIndex,
  activeCombatantLabel,
  onNextTurn,
  onResetEncounter,
}: EncounterActiveHeaderProps) {
  return (
    <Paper
      square
      elevation={1}
      sx={{ px: 4, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <AppBadge
            label={`Round ${roundNumber} \u2022 Turn ${turnIndex + 1}`}
            tone="success"
            variant="filled"
            size="medium"
          />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Current combatant
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {activeCombatantLabel ?? 'None'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            endIcon={<NavigateNextIcon />}
            onClick={onNextTurn}
          >
            Next Turn
          </Button>
          <Button
            variant="text"
            size="small"
            color="inherit"
            onClick={onResetEncounter}
          >
            End Encounter
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
