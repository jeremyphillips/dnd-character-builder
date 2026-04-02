import { Link as RouterLink } from 'react-router-dom'
import { ROUTES } from '@/app/routes'
import { Breadcrumbs } from '@/ui/patterns'
import { useBreadcrumbs } from '@/app/navigation'
import { DEMO_GAME_SESSION_ID } from '../data/mock-game-session'
import { campaignGameSessionLobbyPath } from './gameSessionPaths'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MuiLink from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams } from 'react-router-dom'
import LiveTvIcon from '@mui/icons-material/LiveTv'

export default function GameSessionListRoute() {
  const { id: campaignId } = useParams<{ id: string }>()
  const breadcrumbs = useBreadcrumbs()

  if (!campaignId) return null

  const demoLobby = campaignGameSessionLobbyPath(campaignId, DEMO_GAME_SESSION_ID)

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <LiveTvIcon color="primary" />
        <Typography variant="h5" component="h1">
          Live play
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 640 }}>
        Game sessions are the player-facing live-play container for a campaign (lobby, scheduling,
        location). They are separate from{' '}
        <MuiLink component={RouterLink} to={ROUTES.SESSIONS.replace(':id', campaignId)}>
          calendar sessions
        </MuiLink>{' '}
        and from the{' '}
        <MuiLink component={RouterLink} to={ROUTES.CAMPAIGN_ENCOUNTER.replace(':id', campaignId)}>
          Encounter Simulator
        </MuiLink>
        , which remains a dev/testing combat sandbox.
      </Typography>
      <Card variant="outlined" sx={{ maxWidth: 480 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Demo session
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Open the mock live session to try the lobby and DM setup surfaces. Replace mock data with
            API-backed records when ready.
          </Typography>
          <Button component={RouterLink} to={demoLobby} variant="contained">
            Open demo session
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}
