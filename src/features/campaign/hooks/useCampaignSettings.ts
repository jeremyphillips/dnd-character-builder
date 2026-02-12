import { useEffect, useState } from 'react'
import { apiFetch } from '@/app/api'

export type CampaignSettings = {
  name: string
  description: string
  allowLegacyEditionNpcs: boolean
}

export function useCampaignSettings(campaignId: string | null) {
  const [data, setData] = useState<CampaignSettings | null>(null)
  const [edition, setEdition] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaignId) return

    setLoading(true)
    setError(null)

    apiFetch<{ campaign: CampaignSettings & { edition?: string } }>(
      `/api/campaigns/${campaignId}`
    )
      .then((res) => {
        setData({
          name: res.campaign.name,
          description: res.campaign.description ?? '',
          allowLegacyEditionNpcs: res.campaign.allowLegacyEditionNpcs ?? false
        })
        setEdition(res.campaign.edition)
      })
      .catch(() => setError('Failed to load campaign settings'))
      .finally(() => setLoading(false))
  }, [campaignId])

  return { data, edition, loading, error }
}
