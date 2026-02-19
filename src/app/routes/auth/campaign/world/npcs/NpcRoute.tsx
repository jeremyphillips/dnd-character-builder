import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Breadcrumbs } from '@/ui/elements'
import { useBreadcrumbs } from '@/hooks'
import { getNameById } from '@/domain/lookups'
import { npcs } from '@/data/npcs/npcs'

export default function NpcRoute() {
  const { npcId } = useParams<{ npcId: string }>()

  if (!npcId) return null

  const breadcrumbs = useBreadcrumbs()
  const npcName = getNameById(npcs, npcId)

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h1">
        {npcName}
      </Typography>
    </Box>
  )
}
