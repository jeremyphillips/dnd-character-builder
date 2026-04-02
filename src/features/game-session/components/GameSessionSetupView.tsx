import { useEffect, useState } from 'react'
import type { GameSession, GameSessionStatus } from '../domain/game-session.types'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const STATUS_OPTIONS: { value: GameSessionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

type GameSessionSetupViewProps = {
  session: GameSession
}

export function GameSessionSetupView({ session }: GameSessionSetupViewProps) {
  const [title, setTitle] = useState(session.title)
  const [status, setStatus] = useState<GameSessionStatus>(session.status)
  const [scheduledFor, setScheduledFor] = useState(() =>
    session.scheduledFor ? session.scheduledFor.slice(0, 16) : '',
  )
  const [locationLabel, setLocationLabel] = useState(session.location.label ?? '')
  const [floorNote, setFloorNote] = useState(session.location.floorId ?? '')

  useEffect(() => {
    setTitle(session.title)
    setStatus(session.status)
    setScheduledFor(session.scheduledFor ? session.scheduledFor.slice(0, 16) : '')
    setLocationLabel(session.location.label ?? '')
    setFloorNote(session.location.floorId ?? '')
  }, [session])

  return (
    <Stack spacing={2}>
      <Typography variant="h5" component="h1">
        Session setup
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Session planning and configuration. Persistence is not wired yet; edits stay in this browser
        until an API exists.
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={(e) => e.preventDefault()}>
            <TextField
              label="Session title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as GameSessionStatus)}
              fullWidth
              size="small"
            >
              {STATUS_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Scheduled start (local)"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Location / building context"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              fullWidth
              size="small"
              multiline
              minRows={2}
            />
            <TextField
              label="Floor (optional)"
              value={floorNote}
              onChange={(e) => setFloorNote(e.target.value)}
              fullWidth
              size="small"
            />
            <Box>
              <Button type="submit" variant="contained" disabled>
                Save (API pending)
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Expected participants
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {session.participants.length} row(s) on the mock record. Campaign character pickers and
            invites will attach here later.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
