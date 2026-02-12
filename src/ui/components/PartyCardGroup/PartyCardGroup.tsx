import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import VisibilityIcon from '@mui/icons-material/Visibility'

const PLACEHOLDER_IMG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
      <rect width="400" height="200" fill="#2a2a2a"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="48" fill="#555">⚔️</text>
      <text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#666">Character Portrait</text>
    </svg>`,
  )

export interface PartyCharacterCard {
  _id: string
  name: string
  race: string
  class: string
  level: number
  ownerName: string
  status?: 'pending' | 'approved'
  campaignMemberId?: string
}

export interface PartyCardGroupProps {
  characters: PartyCharacterCard[]
}

export default function PartyCardGroup({ characters }: PartyCardGroupProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {characters.map((char) => (
        <Card key={char._id} variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardMedia
            component="img"
            height="160"
            image={PLACEHOLDER_IMG}
            alt={char.name}
            sx={{ bgcolor: 'var(--mui-palette-action-hover)' }}
          />

          <CardContent sx={{ flex: 1, pb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1 }}>
                {char.name}
              </Typography>
              {char.status === 'pending' && (
                <Chip label="Pending" size="small" color="warning" variant="outlined" sx={{ flexShrink: 0 }} />
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              {char.race} · {char.class} · Level {char.level}
            </Typography>

            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
              Player: {char.ownerName}
            </Typography>
          </CardContent>

          <CardActions sx={{ px: 2, pb: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<VisibilityIcon />}
              href={`/characters/${char._id}`}
            >
              View Details
            </Button>
          </CardActions>
        </Card>
      ))}
    </Box>
  )
}
