import { useBreadcrumbs } from '@/hooks'
import { CharacterBuilderLauncher } from '@/characterBuilder'
// import NpcMediaTopCard from '@/domain/npc/components/NpcMediaTopCard/NpcMediaTopCard'
//import { npcs } from '@/data/npcs/npcs'
import type { EditionId, SettingId } from '@/data'
import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider'
import { NpcGallerySection } from '@/features/npc/sections' 

import { Breadcrumbs } from '@/ui/elements'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export default function NpcsRoute() {
  const {
    campaignId: activeCampaignId, 
    loading: activeCampaignLoading,
    editionId: activeEditionId,
    settingId: activeSettingId,
  } = useActiveCampaign()

  const gridSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
    gap: 2,
  } as const

  const breadcrumbs = useBreadcrumbs()

  if (activeCampaignLoading) return <CircularProgress />

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          NPCs
        </Typography>
        <CharacterBuilderLauncher
          buttonLabel="Create NPC"
          characterType="npc"
          campaignEdition={activeEditionId as EditionId | undefined}
          campaignSetting={activeSettingId as SettingId | undefined}
        />
      </Stack>

      <NpcGallerySection />
    </Box>
  )
}
