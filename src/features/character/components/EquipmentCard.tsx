import type { CharacterDoc } from '@/shared'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'

type EquipmentCardProps = {
  equipment: CharacterDoc['equipment']
}

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
          Equipment
        </Typography>

        {/* Weapons */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Weapons</Typography>
          {(equipment?.weapons ?? []).length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {(equipment?.weapons ?? []).map((w, i) => (
                <Chip key={i} label={w} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">—</Typography>
          )}
        </Box>

        {/* Armor */}
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Armor</Typography>
          {(equipment?.armor ?? []).length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {(equipment?.armor ?? []).map((a, i) => (
                <Chip key={i} label={a} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">—</Typography>
          )}
        </Box>

        {/* Gear */}
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Gear</Typography>
          {(equipment?.gear ?? []).length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              {(equipment?.gear ?? []).map((g, i) => (
                <Chip key={i} label={g} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">—</Typography>
          )}
        </Box>

        {(equipment?.weight ?? 0) > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
            Total weight: {equipment?.weight ?? 0} lbs
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
