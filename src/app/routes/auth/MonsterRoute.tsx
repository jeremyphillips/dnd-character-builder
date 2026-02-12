import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function MonsterRoute() {
  const { monsterId } = useParams<{ monsterId: string }>()
  return (
    <Box>
      <Typography variant="h4" component="h1">
        Monster {monsterId ? `— ${monsterId}` : ''}
      </Typography>
    </Box>
  )
}
