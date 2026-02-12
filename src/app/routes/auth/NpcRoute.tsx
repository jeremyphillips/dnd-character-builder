import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function NpcRoute() {
  const { npcId } = useParams<{ npcId: string }>()
  return (
    <Box>
      <Typography variant="h4" component="h1">
        NPC {npcId ? `— ${npcId}` : ''}
      </Typography>
    </Box>
  )
}
