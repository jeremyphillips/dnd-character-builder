import { useParams, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { useBreadcrumbs } from '@/hooks'
import { ROUTES } from '@/app/routes'

import { useCharacter } from '@/features/character/hooks'
import { useCharacterForm } from '@/features/character/hooks'
import { useCharacterActions } from '@/features/character/hooks'
import CharacterView from '@/features/character/CharacterView'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import MuiLink from '@mui/material/Link'

export default function CharacterRoute() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  useAuth()
  const breadcrumbs = useBreadcrumbs()

  const welcomeState = location.state as { welcomeCampaign?: string; campaignId?: string } | null

  // ── Data + form + action hooks ──────────────────────────────────────
  const state = useCharacter(id)
  const form = useCharacterForm(state.character)
  const actions = useCharacterActions(id, {
    character: state.character,
    setCharacter: state.setCharacter,
    setCampaigns: state.setCampaigns,
    setPendingMemberships: state.setPendingMemberships,
    setError: state.setError,
    setSuccess: state.setSuccess,
    syncFromCharacter: form.syncFromCharacter,
  })

  // ── Render guards ──────────────────────────────────────────────────
  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (state.error && !state.character) {
    return (
      <Box sx={{ maxWidth: 520, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{state.error}</Alert>
      </Box>
    )
  }

  if (!state.character) return null

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      {welcomeState?.welcomeCampaign && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Welcome to {welcomeState.welcomeCampaign}!</AlertTitle>
          Your character activation is pending review from the DM.{' '}
          {welcomeState.campaignId && (
            <MuiLink
              component={Link}
              to={ROUTES.CAMPAIGN.replace(':id', welcomeState.campaignId)}
            >
              View campaign
            </MuiLink>
          )}
        </Alert>
      )}
    <CharacterView
      character={state.character}
      campaigns={state.campaigns}
      pendingMemberships={state.pendingMemberships}
      isOwner={state.isOwner}
      isAdmin={state.isAdmin}
      ownerName={state.ownerName}
      error={state.error}
      success={state.success}
      setError={state.setError}
      name={form.name}
      imageKey={form.imageKey}
      setImageKey={form.setImageKey}
      narrative={form.narrative}
      race={form.race}
      alignment={form.alignment}
      totalLevel={form.totalLevel}
      alignmentOptions={form.alignmentOptions}
      raceOptions={form.raceOptions}
      actions={actions}
      breadcrumbs={breadcrumbs}
    />
    </>
  )
}
