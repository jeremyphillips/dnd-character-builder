import { spells as spellCatalog } from '@/data/classes/spells'
import { SpellHorizontalCard } from '@/domain/spells/components'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'

type SpellsCardProps = {
  spells: string[]
  edition?: string
}

export default function SpellsCard({ spells, edition }: SpellsCardProps) {
  if (spells.length === 0) return null

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
          Spells
        </Typography>
        <Stack spacing={1} sx={{ mt: 0.5 }}>
          {spells.map(spellId => {
            const spell = spellCatalog.find(s => s.id === spellId)
            if (!spell) return <Chip key={spellId} label={spellId} size="small" variant="outlined" />
            const editionEntry = spell.editions.find(e => e.edition === edition)
            return <SpellHorizontalCard key={spellId} spell={spell} editionEntry={editionEntry} />
          })}
        </Stack>
      </CardContent>
    </Card>
  )
}
