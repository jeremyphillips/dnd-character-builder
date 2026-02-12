import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { CharacterBuilderLauncher } from '@/characterBuilder'
import { apiFetch } from '../../api'
import type { EditionId, SettingId } from '@/data'

type CampaignPayload = { campaign?: { edition?: string; setting?: string } }

export default function NpcsRoute() {
  const { id: campaignId } = useParams<{ id: string }>()
  const [campaign, setCampaign] = useState<{ edition?: string; setting?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!campaignId) {
      setLoading(false)
      return
    }
    apiFetch<CampaignPayload>(`/api/campaigns/${campaignId}`)
      .then((data) => setCampaign(data.campaign ?? null))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false))
  }, [campaignId])

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Typography variant="h1" component="h1">
        NPCs
      </Typography>
      <CharacterBuilderLauncher
        buttonLabel="Create NPC"
        characterType="npc"
        campaignEdition={campaign?.edition as EditionId | undefined}
        campaignSetting={campaign?.setting as SettingId | undefined}
      />
    </Box>
  )
}
