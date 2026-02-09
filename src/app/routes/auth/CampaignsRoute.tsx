import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { editions, settings } from '@/data'
import CampaignForm, { type CampaignFormData } from '../../components/CampaignForm'

interface Campaign {
  _id: string
  name: string
  setting: string
  edition: string
  description: string
  adminId: string
  members: string[]
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
      const res = await fetch('/api/campaigns', { credentials: 'include' })
      const data = await res.json()
      setCampaigns(data.campaigns ?? [])
    } catch {
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(data: CampaignFormData) {
    await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    setShowCreateForm(false)
    await fetchCampaigns()
  }

  function getSettingName(id: string) {
    return settings.find(s => s.id === id)?.name ?? id
  }

  function getEditionName(id: string) {
    return editions.find(e => e.id === id)?.name ?? id
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
            <div key={c._id} className="item-card">
              <div className="item-card-info">
                <strong>{c.name}</strong>
                <span>
                  {getEditionName(c.edition)} · {getSettingName(c.setting)}
                  {' · '}
                  {c.members.length} member{c.members.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Link to={`/campaigns/${c._id}`} className="btn-size-sm btn-theme-secondary">
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
