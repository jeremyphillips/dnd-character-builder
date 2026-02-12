import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { monsters } from '@/data/monsters'
import MonsterMediaTopCard from '@/domain/monsters/components/MonsterMediaTopCard/MonsterMediaTopCard'
import { ROUTES } from '../../routes'

export default function MonstersRoute() {
  const { id: campaignId } = useParams<{ id: string }>()
  const first12 = monsters.slice(0, 12)

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Monsters
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {first12.map((monster) => (
          <MonsterMediaTopCard
            key={monster.id}
            name={monster.name}
            type={monster.type}
            subtype={monster.subtype}
            sizeCategory={monster.sizeCategory}
            link={campaignId ? ROUTES.WORLD_MONSTER.replace(':id', campaignId).replace(':monsterId', monster.id) : undefined}
          />
        ))}
      </Box>
    </Box>
  )
}
