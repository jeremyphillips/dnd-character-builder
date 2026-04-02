import { NavLink, Outlet, useParams, useLocation } from 'react-router-dom'
import { Breadcrumbs } from '@/ui/patterns'
import { useBreadcrumbs } from '@/app/navigation'
import { useGameSession } from '../hooks/useGameSession'
import {
  campaignGameSessionLobbyPath,
  campaignGameSessionSetupPath,
  campaignGameSessionsListPath,
} from './gameSessionPaths'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'

export default function GameSessionLayout() {
  const { id: campaignId, gameSessionId } = useParams<{ id: string; gameSessionId: string }>()
  const { pathname } = useLocation()
  const { session } = useGameSession()
  const breadcrumbs = useBreadcrumbs()

  if (!campaignId || !gameSessionId) {
    return null
  }

  const lobbyPath = campaignGameSessionLobbyPath(campaignId, gameSessionId)
  const setupPath = campaignGameSessionSetupPath(campaignId, gameSessionId)
  const inLobby = pathname.endsWith('/lobby')
  const inSetup = pathname.endsWith('/setup')

  if (!session) {
    return (
      <Box>
        <Breadcrumbs items={breadcrumbs} />
        <Typography variant="h6" gutterBottom>
          Game session not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          There is no live session for this id yet (or it is not available in the current mock).
        </Typography>
        <MuiLink component={RouterLink} to={campaignGameSessionsListPath(campaignId)}>
          Back to live play
        </MuiLink>
      </Box>
    )
  }

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          component={NavLink}
          to={lobbyPath}
          variant={inLobby ? 'contained' : 'outlined'}
          size="small"
        >
          Lobby
        </Button>
        <Button
          component={NavLink}
          to={setupPath}
          variant={inSetup ? 'contained' : 'outlined'}
          size="small"
        >
          Setup
        </Button>
      </Stack>
      <Outlet />
    </Box>
  )
}
