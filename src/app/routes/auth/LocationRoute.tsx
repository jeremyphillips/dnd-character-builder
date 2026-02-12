import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

export default function LocationRoute() {
  const { locationId } = useParams<{ locationId: string }>()
  return (
    <Box>
      <Typography variant="h4" component="h1">
        Location {locationId ? `— ${locationId}` : ''}
      </Typography>
    </Box>
  )
}
