import { useState } from 'react'
import { apiFetch } from '@/app/api'
import type { CampaignSettings } from './useCampaignSettings'

export function useUpdateCampaignSettings(campaignId: string | null) {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = async (data: CampaignSettings) => {
    if (!campaignId) return
    setError(null)
    setSuccess(false)

    try {
      await apiFetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        body: data
      })
      setSuccess(true)
    } catch {
      setError('Failed to save campaign settings')
    }
  }

  return { update, success, error }
}
