import { useParams } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { useBreadcrumbs } from '@/hooks'

import { useCharacter } from '@/features/character/hooks'
import { useCharacterForm } from '@/features/character/hooks'
import { useCharacterActions } from '@/features/character/hooks'
import CharacterView from '@/features/character/CharacterView'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

export default function CharacterRoute() {
  const { id } = useParams<{ id: string }>()
  useAuth()
  const breadcrumbs = useBreadcrumbs()

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
  )
}
