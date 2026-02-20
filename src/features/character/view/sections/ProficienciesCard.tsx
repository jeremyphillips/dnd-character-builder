import type { CharacterDoc } from '@/shared'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

type ProficienciesCardProps = {
  proficiencies: CharacterDoc['proficiencies']
  wealth: CharacterDoc['wealth']
}

export default function ProficienciesCard({ proficiencies, wealth }: ProficienciesCardProps) {
  console.log('ProficienciesCard proficiencies', proficiencies)
  const taxanomyName =
    (proficiencies && Array.isArray(proficiencies) && proficiencies[0]?.taxonomy) ?? 'Proficiencies'
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
          {taxanomyName}
        </Typography>
        {(proficiencies ?? []).length > 0 ? (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
            {(proficiencies ?? []).map((p, i) => (
              <Chip key={i} label={typeof p === 'string' ? p : p.option?.name ?? p.name} size="small" variant="outlined" />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>—</Typography>
        )}

        {/* Wealth */}
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
          Wealth
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" fontWeight={600}>{wealth?.gp ?? 0} gp</Typography>
          <Typography variant="body2">{wealth?.sp ?? 0} sp</Typography>
          <Typography variant="body2">{wealth?.cp ?? 0} cp</Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
