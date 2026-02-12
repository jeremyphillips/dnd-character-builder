import { useEffect, useState } from 'react'
import { useParams, Outlet, useMatch, Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { editions, settings } from '@/data'
import { getById } from '@/domain/lookups'
// import CampaignForm, { type CampaignFormData } from '../../../features/campaign/components/CampaignForm'
import { getPartyMembers } from '@/domain/party'
import type { PartyMember } from '@/domain/party'
import { Hero } from '@/ui/elements'
import CharacterMediaTopCard from '@/domain/character/components/CharacterMediaTopCard/CharacterMediaTopCard'
import { ROUTES } from '../../routes'
import Box from '@mui/material/Box'
import { apiFetch } from '../../api'

interface CampaignMember {
  userId: string
  role: 'dm' | 'player' | 'observer'
  joinedAt: string
}

interface Campaign {
  _id: string
  name: string
  setting: string
  edition: string
  description: string
  adminId: string
  members: CampaignMember[]
}

export default function CampaignRoute() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isExactCampaign = useMatch({ path: '/campaigns/:id', end: true })

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [partyCharacters, setPartyCharacters] = useState<PartyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)

  const isOwner = campaign?.adminId === user?.id

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

  async function handleInvite() {
    const email = prompt('Enter the email of the user to invite:')
    if (!email) return

    setInviting(true)
    try {
      const data = await apiFetch<{ message?: string }>(
        `/api/campaigns/${id}/members`,
        { method: 'POST', body: { email } }
      )

      if (data.message) {
        alert(data.message)
      }

      await fetchCampaign()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to invite user')
    } finally {
      setInviting(false)
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
    getEditionName(campaign.edition),
    getSettingName(campaign.setting),
    `${campaign.members.length} member${campaign.members.length !== 1 ? 's' : ''}`,
  ].join(' · ')

  return (
    <div>
      <Hero
        headline={campaign.name}
        subheadline={subheadline}
        image={(campaign as { imageUrl?: string }).imageUrl}
      />

      <h3>Campaign</h3>
      {/* <CampaignForm
        initial={{
          name: campaign.name,
          edition: campaign.edition,
          setting: campaign.setting,
        }}
        onSubmit={handleSave}
        onCancel={() => navigate(ROUTES.CAMPAIGNS)}
        submitLabel="Save"
        submittingLabel="Saving…"
        canEdit={isOwner}
      /> */}

      {isOwner && (
        <button onClick={handleInvite} disabled={inviting}>
          {inviting ? 'Inviting…' : 'Invite User'}
        </button>
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
            status={char.status}
            attribution={char.ownerName}
            link={`/characters/${char._id}`}
          />
        ))}
      </Box>
    </div>
  )
}
