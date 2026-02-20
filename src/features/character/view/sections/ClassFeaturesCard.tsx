import type { CharacterDoc, CharacterClassInfo } from '@/shared'
import { classes as classesData } from '@/data'
import { getById } from '@/domain/lookups'
import { getClassProgression } from '@/features/character/domain/progression'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

function getClassName(classId?: string): string {
  if (!classId) return 'Unknown'
  const c = getById(classesData, classId)
  return c?.name ?? classId
}

type ClassFeaturesCardProps = {
  character: CharacterDoc
  filledClasses: CharacterClassInfo[]
  isMulticlass: boolean
}

export default function ClassFeaturesCard({
  character,
  filledClasses,
  isMulticlass,
}: ClassFeaturesCardProps) {
  const hasFeatures = filledClasses.some(cls => getClassProgression(cls.classId, character.edition))
  if (!hasFeatures) return null

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
          Class Features
        </Typography>

        {filledClasses.map((cls, i) => {
          const prog = getClassProgression(cls.classId, character.edition)
          if (!prog) return null
          const clsLevel = cls.level ?? character.totalLevel ?? 1
          const activeFeatures = (prog.features ?? []).filter(f => f.level <= clsLevel)
          if (activeFeatures.length === 0) return null

          return (
            <Box key={i} sx={{ mt: 1, mb: i < filledClasses.length - 1 ? 2 : 0 }}>
              {isMulticlass && (
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {getClassName(cls.classId)} (Level {cls.level})
                </Typography>
              )}
              <Grid container spacing={0.25}>
                {activeFeatures.map((f, fi) => (
                  <Grid key={fi} size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2">
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ minWidth: 36, display: 'inline-block' }}>
                        Lv {f.level}
                      </Typography>
                      {' '}{f.name}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}
