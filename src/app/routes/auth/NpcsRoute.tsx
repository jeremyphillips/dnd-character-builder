import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { CharacterBuilderLauncher } from '@/characterBuilder'

export default function NpcsRoute() {
  return (
    <Box>
      <Typography variant="h4" component="h1">
        NPCs
      </Typography>
      <CharacterBuilderLauncher characterType="npc" />  
    </Box>
  )
}
