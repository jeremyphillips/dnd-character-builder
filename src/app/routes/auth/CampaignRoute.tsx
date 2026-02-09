import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { editions, settings } from '@/data'
import CampaignForm, { type CampaignFormData } from '../../components/CampaignForm'
import { ROUTES } from '../../routes'

interface Campaign {
  _id: string
  name: string
  setting: string
  edition: string
  description: string
  adminId: string
  members: string[]
}

export default function CampaignRoute() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)

  const isOwner = campaign?.adminId === user?.id

  useEffect(() => {
    fetchCampaign()
  }, [id])

  async function fetchCampaign() {
    try {
      const res = await fetch(`/api/campaigns/${id}`, { credentials: 'include' })
      if (!res.ok) {
        setCampaign(null)
        return
      }
      const data = await res.json()
      setCampaign(data.campaign)
    } catch {
      setCampaign(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(data: CampaignFormData) {
    await fetch(`/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    await fetchCampaign()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    await fetch(`/api/campaigns/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    navigate(ROUTES.CAMPAIGNS)
  }

  async function handleInvite() {
    const email = prompt('Enter the email of the user to invite:')
    if (!email) return

    setInviting(true)
    try {
      const res = await fetch(`/api/campaigns/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        alert(data.error || 'Failed to invite user')
        return
      }

      if (data.message) {
        alert(data.message)
      }

      await fetchCampaign()
    } finally {
      setInviting(false)
    }
  }

  function getSettingName(settingId: string) {
    return settings.find(s => s.id === settingId)?.name ?? settingId
  }

  function getEditionName(editionId: string) {
    return editions.find(e => e.id === editionId)?.name ?? editionId
  }

  if (loading) return <p>Loading campaign…</p>
  if (!campaign) return <p>Campaign not found.</p>

  return (
    <div>
      <div className="page-header">
        <h1>{campaign.name}</h1>
      </div>

      <p>
        {getEditionName(campaign.edition)} · {getSettingName(campaign.setting)}
        {' · '}
        {campaign.members.length} member{campaign.members.length !== 1 ? 's' : ''}
      </p>

      {isOwner && (
        <>
          <h3>Edit Campaign</h3>
          <CampaignForm
            initial={{
              name: campaign.name,
              edition: campaign.edition,
              setting: campaign.setting,
            }}
            onSubmit={handleSave}
            onCancel={() => navigate(ROUTES.CAMPAIGNS)}
            submitLabel="Save"
            submittingLabel="Saving…"
          />

          <hr />

          <div className="form-actions">
            <button
              onClick={handleInvite}
              disabled={inviting}
            >
              {inviting ? 'Inviting…' : 'Invite User'}
            </button>

            <button
              className="btn-theme-danger"
              onClick={handleDelete}
            >
              Delete Campaign
            </button>
          </div>
        </>
      )}
    </div>
  )
}
