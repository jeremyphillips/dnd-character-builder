import { useEffect, useState } from 'react'
import { apiFetch } from '@/app/api'

export type CampaignSettings = {
  name: string
  description: string
  allowLegacyEditionNpcs: boolean
}

type CampaignResponse = {
  campaign: {
    identity: {
      name?: string
      description?: string
      setting?: string
      edition?: string
    }
    configuration: {
      allowLegacyEditionNpcs?: boolean
    }
  }
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

    apiFetch<CampaignResponse>(`/api/campaigns/${campaignId}`)
      .then((res) => {
        const { identity, configuration } = res.campaign
        setData({
          name: identity.name ?? '',
          description: identity.description ?? '',
          allowLegacyEditionNpcs: configuration.allowLegacyEditionNpcs ?? false
        })
        setEdition(identity.edition)
      })
      .catch(() => setError('Failed to load campaign settings'))
      .finally(() => setLoading(false))
  }, [campaignId])

  return { data, edition, loading, error }
}
