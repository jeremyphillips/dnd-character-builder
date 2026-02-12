import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ROUTES } from '../../routes'
import { apiFetch } from '../../api'
import { InviteConfirmationBox } from '@/ui/components'
import { getCharacterOptionLabel } from '@/domain/character'
import { getNameById } from '@/domain/lookups'
import { settings, editions } from '@/data'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CharacterForOption {
  _id: string
  name: string
  level?: number
  totalLevel?: number
  class?: string
  classes?: { classId?: string; classDefinitionId?: string; level: number }[]
  edition?: string
  setting?: string
}

interface InviteData {
  _id: string
  campaignId: string
  invitedByName: string
  role: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  respondedAt: string | null
  campaign: {
    _id: string
    name: string
    setting: string
    edition: string
    description?: string
  } | null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function InviteRoute() {
  const { inviteId } = useParams<{ inviteId: string }>()

  const [invite, setInvite] = useState<InviteData | null>(null)
  const [availableCharacters, setAvailableCharacters] = useState<CharacterForOption[]>([])
  const [selectedCharacterId, setSelectedCharacterId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responding, setResponding] = useState(false)

  // ── Load invite ────────────────────────────────────────────────────
  useEffect(() => {
    if (!inviteId) return
    setLoading(true)
    apiFetch<{ invite: InviteData }>(`/api/invites/${inviteId}`)
      .then((data) => setInvite(data.invite))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [inviteId])

  // ── Load available characters when invite is pending ─────────────────
  useEffect(() => {
    if (!invite || invite.status !== 'pending') return
    apiFetch<{ characters: CharacterForOption[] }>('/api/characters/available-for-campaign')
      .then((data) => setAvailableCharacters(data.characters ?? []))
      .catch(() => setAvailableCharacters([]))
  }, [invite?.status])

  const characterOptions = useMemo(() => {
    const campaignSettingId = invite?.campaign?.setting
    const campaignEditionId = invite?.campaign?.edition
    const filtered = availableCharacters.filter((c) => {
      const matchesSetting = !campaignSettingId || c.setting === campaignSettingId
      const matchesEdition = !campaignEditionId || c.edition === campaignEditionId
      return matchesSetting && matchesEdition
    })
    return filtered.map((c) => ({
      value: c._id,
      label: getCharacterOptionLabel(c),
    }))
  }, [availableCharacters, invite?.campaign?.setting, invite?.campaign?.edition])

  // ── Respond ────────────────────────────────────────────────────────
  async function handleRespond(action: 'accept' | 'decline') {
    if (!inviteId) return
    if (action === 'accept' && characterOptions.length > 0 && !selectedCharacterId) return
    setResponding(true)
    try {
      const body: { action: 'accept' | 'decline'; characterId?: string } = { action }
      if (action === 'accept' && selectedCharacterId) body.characterId = selectedCharacterId
      const data = await apiFetch<{ invite: { status: InviteData['status']; respondedAt: string | null } }>(
        `/api/invites/${inviteId}/respond`,
        { method: 'POST', body },
      )
      setInvite((prev) => (prev ? { ...prev, status: data.invite.status, respondedAt: data.invite.respondedAt } : prev))

      // If accepted, character is pending DM approval — optionally navigate to campaign to view
      if (action === 'accept' && invite?.campaign?._id) {
        // Keep user on invite page to see "pending approval" message; link available to go to campaign
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setResponding(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !invite) {
    return (
      <Box sx={{ maxWidth: 520, mx: 'auto', mt: 6 }}>
        <Alert severity="error">{error ?? 'Invite not found'}</Alert>
      </Box>
    )
  }

  const campaignChips = invite.campaign
    ? [
        { label: invite.campaign.setting },
        { label: invite.campaign.edition },
        { label: `Role: ${invite.role}`, color: 'primary' as const },
      ]
    : undefined

  const settingName = invite.campaign?.setting
    ? getNameById(settings as unknown as { id: string; name: string }[], invite.campaign!.setting) ?? invite.campaign.setting
    : undefined

  const editionName = invite.campaign?.edition
    ? getNameById(editions as unknown as { id: string; name: string }[], invite.campaign!.edition) ?? invite.campaign.edition
    : undefined

  const characterRestrictionMessage =
    settingName && editionName
      ? `This campaign only allows characters generated for ${settingName} in ${editionName}.`
      : settingName
        ? `This campaign only allows characters generated for ${settingName}.`
        : editionName
          ? `This campaign only allows characters generated for ${editionName}.`
          : undefined

  return (
    <InviteConfirmationBox
      headline="Campaign Invite"
      invitedByLabel={`${invite.invitedByName} invited you to join`}
      status={invite.status}
      responding={responding}
      onRespond={handleRespond}
      characterOptions={characterOptions}
      selectedCharacterId={selectedCharacterId}
      onCharacterChange={setSelectedCharacterId}
      characterRestrictionMessage={characterRestrictionMessage}
      detailTitle={invite.campaign?.name}
      detailChips={campaignChips}
      detailDescription={invite.campaign?.description}
      acceptedLink={
        invite.campaign
          ? { to: ROUTES.CAMPAIGN.replace(':id', invite.campaign._id), label: 'Go to Campaign' }
          : undefined
      }
      acceptedMessage="Invite accepted. Your character is pending DM approval."
      footer={`Sent ${new Date(invite.createdAt).toLocaleDateString()}`}
    />
  )
}
