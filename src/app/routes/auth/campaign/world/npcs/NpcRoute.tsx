import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Breadcrumbs } from '@/ui/elements'
import { useBreadcrumbs } from '@/hooks'

export default function NpcRoute() {
  const { npcId } = useParams<{ npcId: string }>()
  const breadcrumbs = useBreadcrumbs()
  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />
      <Typography variant="h4" component="h1">
        NPC {npcId ? `— ${npcId}` : ''}
      </Typography>
    </Box>
  )
}
