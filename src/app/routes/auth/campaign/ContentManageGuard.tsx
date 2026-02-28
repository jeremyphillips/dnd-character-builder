import { Navigate, Outlet } from 'react-router-dom'
import { Box, Stack, Typography, Alert, Button } from '@mui/material'

import { useAuth } from '@/app/providers/AuthProvider'
import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider'
import { ROUTES } from '@/app/routes'
import { toViewerContext, canManageContent } from '@/shared/domain/capabilities'

export default function ContentManageGuard() {
  const { user } = useAuth()
  const { campaignId, campaign, loading } = useActiveCampaign()

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (loading) return null

  const ctx = toViewerContext(campaign?.viewer)
  const canAccess = canManageContent(ctx)

  if (!canAccess) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Access denied</Typography>
          <Alert severity="error">
            You don’t have permission to manage campaign content.
          </Alert>

          {/* Optional: helpful actions */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => window.history.back()}
            >
              Go back
            </Button>
            {campaignId && (
              <Button
                variant="text"
                href={`/campaigns/${campaignId}/world`}
              >
                Back to World
              </Button>
            )}
          </Stack>

          {/* Optional: debug context */}
          <Typography variant="body2" color="text.secondary">
            Requested: {location.pathname}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return <Outlet />
}
