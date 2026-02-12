import { useParams } from 'react-router-dom'

export const useActiveCampaign = () => {
  const { campaignId } = useParams()
  return campaignId ?? null
}