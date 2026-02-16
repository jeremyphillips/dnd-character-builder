import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import CampaignForm, { type CampaignFormData } from '@/features/campaign/components/CampaignForm'
import CampaignHorizontalCard from '@/domain/campaign/components/CampaignHorizontalCard/CampaignHorizontalCard'
import { apiFetch, ApiError } from '@/app/api'

interface Campaign {
  _id: string
  identity: {
    name?: string
    setting?: string
    edition?: string
    description?: string
  }
  membership: {
    adminId: string
  }
  memberCount: number
}

export default function CampaignsRoute() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  const [showCreateForm, setShowCreateForm] = useState(false)

  const canCreate = user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      const data = await apiFetch<{ campaigns: Campaign[] }>('/api/campaigns')
      setCampaigns(data.campaigns ?? [])
    } catch {
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(data: CampaignFormData) {
    try {
      await apiFetch('/api/campaigns', { method: 'POST', body: data })
      setShowCreateForm(false)
      await fetchCampaigns()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to create campaign')
    }
  }

  if (loading) return <p>Loading campaigns...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Campaigns</h1>
        {canCreate && !showCreateForm && (
          <button onClick={() => setShowCreateForm(true)}>
            + New Campaign
          </button>
        )}
      </div>

      {showCreateForm && (
        <>
          <h3>Create Campaign</h3>
          <CampaignForm
            initial={{ name: '', edition: '', setting: '' }}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            submitLabel="Create"
            submittingLabel="Creating…"
          />
        </>
      )}

      {campaigns.length === 0 ? (
        <p className="empty-state">No campaigns yet.</p>
      ) : (
        <div className="item-list">
          {campaigns.map((c) => (
            <CampaignHorizontalCard
              key={c._id}
              campaignId={c._id}
              name={c.identity.name ?? ''}
              description={c.identity.description}
              edition={c.identity.edition}
              setting={c.identity.setting}
              memberCount={c.memberCount}
            />
          ))}
        </div>
      )}
    </div>
  )
}
