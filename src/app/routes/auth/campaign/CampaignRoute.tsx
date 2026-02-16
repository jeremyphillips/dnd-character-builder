import { useEffect, useState } from 'react'
import { useParams, Outlet, useMatch, Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { editions, settings } from '@/data'
import { getById } from '@/domain/lookups'
import { getPartyMembers } from '@/domain/party'
import type { PartyMember } from '@/domain/party'
import { Hero } from '@/ui/elements'
import CharacterMediaTopCard from '@/domain/character/components/CharacterMediaTopCard/CharacterMediaTopCard'
import { resolveImageUrl } from '@/utils/image'
import { FormModal, ConfirmModal } from '@/ui/modals'
import type { FieldConfig } from '@/ui/components/form'
import { ROUTES } from '@/app/routes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { apiFetch } from '@/app/api'

interface Campaign {
  _id: string
  identity: {
    name: string
    setting: string
    edition: string
    description: string
  }
  membership: {
    adminId: string
  }
  memberCount: number
}

type InviteFormData = { email: string }

type PreCheckResult = {
  status: 'ok' | 'no_account' | 'active_character' | 'already_member'
  userName?: string
}

const inviteFields: FieldConfig[] = [
  {
    type: 'text',
    name: 'email',
    label: 'Email Address',
    inputType: 'email',
    required: true,
    placeholder: 'player@example.com',
  },
]

const inviteDefaults: InviteFormData = { email: '' }

export default function CampaignRoute() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isExactCampaign = useMatch({ path: '/campaigns/:id', end: true })

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [partyCharacters, setPartyCharacters] = useState<PartyMember[]>([])
  const [loading, setLoading] = useState(true)

  // Invite modal state
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  // Confirm modal state (for active-character warning)
  const [confirmState, setConfirmState] = useState<{
    email: string
    userName: string
  } | null>(null)
  const [confirming, setConfirming] = useState(false)

  const isOwner = campaign?.membership.adminId === user?.id

  useEffect(() => {
    fetchCampaign()
  }, [id])

  useEffect(() => {
    if (!id || !campaign) {
      setPartyCharacters([])
      return
    }
    getPartyMembers(id, (campaignId) =>
      apiFetch<{ characters?: import('@/domain/party').PartyMemberApiRow[] }>(
        `/api/campaigns/${campaignId}/party`
      )
    )
      .then(setPartyCharacters)
      .catch(() => setPartyCharacters([]))
  }, [id, campaign])

  async function fetchCampaign() {
    try {
      const data = await apiFetch<{ campaign: Campaign }>(`/api/campaigns/${id}`)
      setCampaign(data.campaign)
    } catch {
      setCampaign(null)
    } finally {
      setLoading(false)
    }
  }

  async function sendInvite(email: string) {
    const data = await apiFetch<{ message?: string }>(
      `/api/campaigns/${id}/members`,
      { method: 'POST', body: { email } }
    )
    setInviteSuccess(data.message ?? 'Invite sent')
    await fetchCampaign()
  }

  async function handleInviteSubmit({ email }: InviteFormData) {
    // Pre-check before sending
    const check = await apiFetch<PreCheckResult>(
      `/api/campaigns/${id}/members/pre-check`,
      { method: 'POST', body: { email } }
    )

    if (check.status === 'already_member') {
      throw new Error(`${check.userName ?? email} is already a member of this campaign.`)
    }

    if (check.status === 'active_character') {
      // Close form modal, open confirm modal
      setInviteOpen(false)
      setConfirmState({ email, userName: check.userName ?? email })
      return
    }

    // 'ok' or 'no_account' — proceed directly
    await sendInvite(email)
  }

  async function handleConfirmInvite() {
    if (!confirmState) return
    setConfirming(true)
    try {
      await sendInvite(confirmState.email)
      setConfirmState(null)
    } catch {
      setConfirmState(null)
    } finally {
      setConfirming(false)
    }
  }

  const getSettingName = (settingId: string) =>
    getById(settings as unknown as { id: string; name: string }[], settingId)?.name ?? settingId
  const getEditionName = (editionId: string) =>
    getById(editions as unknown as { id: string; name: string }[], editionId)?.name ?? editionId

  if (loading) return <p>Loading campaign…</p>
  if (!campaign) return <p>Campaign not found.</p>

  // Render child route (e.g. sessions) when URL goes deeper than /campaigns/:id
  if (!isExactCampaign) return <Outlet />

  const subheadline = [
    getEditionName(campaign.identity.edition),
    getSettingName(campaign.identity.setting),
    `${campaign.memberCount} member${campaign.memberCount !== 1 ? 's' : ''}`,
  ].join(' · ')

  return (
    <div>
      <Hero
        headline={campaign.identity.name}
        subheadline={subheadline}
        image={(campaign as { imageUrl?: string }).imageUrl}
      />

      <h3>Campaign</h3>

      {isOwner && (
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={() => { setInviteSuccess(null); setInviteOpen(true) }}
        >
          Invite User
        </Button>
      )}

      {inviteSuccess && (
        <Alert severity="success" onClose={() => setInviteSuccess(null)} sx={{ mt: 2 }}>
          {inviteSuccess}
        </Alert>
      )}

      <h3>Sessions</h3>
      <Link to={ROUTES.SESSIONS.replace(':id', id!)}>View Sessions</Link>

      <h3>Party</h3>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {partyCharacters.map((char) => (
          <CharacterMediaTopCard
            key={char._id}
            characterId={char._id}
            name={char.name}
            race={char.race}
            class={char.class}
            level={char.level}
            imageUrl={resolveImageUrl(char.imageKey)}
            status={char.status}
            attribution={{ name: char.ownerName, imageUrl: char.ownerAvatarUrl }}
            link={`/characters/${char._id}`}
          />
        ))}
      </Box>

      {/* Invite User modal */}
      <FormModal<InviteFormData>
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={handleInviteSubmit}
        headline="Invite User"
        description="Enter the email address of the player you'd like to invite to this campaign."
        fields={inviteFields}
        defaultValues={inviteDefaults}
        submitLabel="Invite"
        cancelLabel="Cancel"
        size="compact"
      />

      {/* Active character confirmation */}
      <ConfirmModal
        open={!!confirmState}
        onCancel={() => setConfirmState(null)}
        onConfirm={handleConfirmInvite}
        headline="Player Already Active"
        description={
          confirmState
            ? `${confirmState.userName} already has an active character in ${campaign.identity.name}. Do you want to proceed?`
            : ''
        }
        confirmLabel="Proceed"
        cancelLabel="Cancel"
        confirmColor="warning"
        loading={confirming}
      />
    </div>
  )
}
