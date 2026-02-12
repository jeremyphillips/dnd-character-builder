import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { CharacterBuilderLauncher } from '@/characterBuilder'

export default function CharacterBuilderRoute() {

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dungeon &amp; Dragons Character Generator
      </Typography>

      <CharacterBuilderLauncher />
    </Box>
  )
}
