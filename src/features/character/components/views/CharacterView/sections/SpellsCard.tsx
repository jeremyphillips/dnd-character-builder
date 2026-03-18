import { useCampaignRules } from '@/app/providers/CampaignRulesProvider'
import { SpellHorizontalCard } from '@/features/content/spells/components'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import EditIcon from '@mui/icons-material/Edit'

type SpellsCardProps = {
  spells: string[]
  onEdit?: () => void
}

export default function SpellsCard({ spells, onEdit }: SpellsCardProps) {
  const { catalog } = useCampaignRules()

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            Spells
          </Typography>
          {onEdit && (
            <Button
              size="small"
              startIcon={<EditIcon fontSize="small" />}
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
        </Stack>
        <Stack spacing={1} sx={{ mt: 0.5 }}>
          {spells.map(spellId => {
            const spell = catalog.spellsById[spellId]
            if (!spell) return <Chip key={spellId} label={spellId} size="small" variant="outlined" />
            return <SpellHorizontalCard key={spellId} spell={spell} />
          })}
        </Stack>
      </CardContent>
    </Card>
  )
}
