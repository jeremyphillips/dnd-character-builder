import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { CharacterBuilderLauncher } from '@/characterBuilder'
import NpcMediaTopCard from '@/domain/npc/components/NpcMediaTopCard/NpcMediaTopCard'
import { npcs } from '@/data/npcs/npcs'
import { ROUTES } from '../../routes'
import { apiFetch } from '../../api'
import type { EditionId, SettingId } from '@/data'
import type { Character } from '@/shared/types'

type NpcWithId = Character & { id: string }

type CampaignPayload = { campaign?: { edition?: string; setting?: string } }

const filterNpcsByCampaign = (
  npcsList: readonly Character[],
  edition?: string,
  setting?: string
): NpcWithId[] => {
  if (!edition) return []
  return npcsList.filter((npc): npc is NpcWithId => {
    if (npc.edition !== edition) return false
    if (!('id' in npc) || !npc.id) return false
    if (!npc.setting) return true
    return npc.setting === setting
  })
}

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

  const filteredNpcs = useMemo(
    () => filterNpcsByCampaign(npcs, campaign?.edition, campaign?.setting),
    [campaign?.edition, campaign?.setting]
  )

  const gridSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
    gap: 2,
  } as const

  const npcLink = (npcId: string) =>
    campaignId ? ROUTES.WORLD_NPC.replace(':id', campaignId).replace(':npcId', npcId) : undefined

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          NPCs
        </Typography>
        <CharacterBuilderLauncher
          buttonLabel="Create NPC"
          characterType="npc"
          campaignEdition={campaign?.edition as EditionId | undefined}
          campaignSetting={campaign?.setting as SettingId | undefined}
        />
      </Stack>

      <Box sx={gridSx}>
        {filteredNpcs.map((npc) => (
          <NpcMediaTopCard
            key={npc.id}
            npc={npc}
            link={npcLink(npc.id)}
          />
        ))}
      </Box>
    </Box>
  )
}
