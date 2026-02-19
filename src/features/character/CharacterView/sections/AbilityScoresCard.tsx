import type { CharacterDoc } from '@/shared'
import { StatCircle } from '@/ui/elements'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

type AbilityScoresCardProps = {
  stats: NonNullable<CharacterDoc['stats']>
}

export default function AbilityScoresCard({ stats }: AbilityScoresCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ px: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block', textAlign: 'center', mb: 1 }}>
          Ability Scores
        </Typography>
        <Stack spacing={1} alignItems="center">
          <StatCircle label="Strength" value={stats.strength} />
          <StatCircle label="Dexterity" value={stats.dexterity} />
          <StatCircle label="Constitution" value={stats.constitution} />
          <StatCircle label="Intelligence" value={stats.intelligence} />
          <StatCircle label="Wisdom" value={stats.wisdom} />
          <StatCircle label="Charisma" value={stats.charisma} />
        </Stack>
      </CardContent>
    </Card>
  )
}
