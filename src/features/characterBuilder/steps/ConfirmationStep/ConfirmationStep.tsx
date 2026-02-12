import { useCharacterBuilder } from '../../context'
import { editions, settings, races, classes } from '@/data'
import { standardAlignments, fourEAlignments, basicAlignments } from '@/data/alignments'
import { getNameById } from '@/domain/lookups'
import type { StepId } from '../../types'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAlignmentName(alignmentId: string | undefined): string {
  if (!alignmentId) return '—'

  // Try all alignment lists
  const allAlignments = [...standardAlignments, ...fourEAlignments, ...basicAlignments]
  const found = allAlignments.find((a) => a.id === alignmentId)
  return found?.name ?? alignmentId
}

function getClassLine(
  cls: { classId?: string; classDefinitionId?: string; level: number },
  allClasses: typeof classes,
  isPrimary: boolean,
  isMulticlass: boolean,
): string {
  const classData = allClasses.find((c) => c.id === cls.classId)
  const name = classData?.name ?? cls.classId ?? 'Unknown'

  let subclassName = ''
  if (cls.classDefinitionId && classData) {
    const subclass = (classData as any).definitions?.find(
      (d: any) => d.id === cls.classDefinitionId,
    )
    if (subclass?.name) {
      subclassName = subclass.name
    }
  }

  let line = name
  if (subclassName) line += `, ${subclassName}`
  line += ` (Lvl ${cls.level})`
  if (isPrimary && isMulticlass) line += ' (primary)'

  return line
}

// ---------------------------------------------------------------------------
// Summary card
// ---------------------------------------------------------------------------

interface SummaryCardProps {
  label: string
  stepId: StepId
  value: React.ReactNode
  onEdit: (stepId: StepId) => void
  filled?: boolean
}

function SummaryCard({ label, stepId, value, onEdit, filled = true }: SummaryCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: filled ? 'transparent' : 'var(--mui-palette-action-hover)',
        opacity: filled ? 1 : 0.7,
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
              {label}
            </Typography>
            <Box sx={{ mt: 0.25 }}>{value}</Box>
          </Box>
          <Button
            size="small"
            startIcon={<EditIcon fontSize="small" />}
            onClick={() => onEdit(stepId)}
            sx={{ ml: 1, flexShrink: 0 }}
          >
            Edit
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// ConfirmationStep
// ---------------------------------------------------------------------------

const ConfirmationStep = () => {
  const { state, goToStep, setName } = useCharacterBuilder()

  const editionName = getNameById(editions as unknown as { id: string; name: string }[], state.edition) ?? state.edition ?? '—'
  const settingName = getNameById(settings as unknown as { id: string; name: string }[], state.setting) ?? state.setting ?? 'None'
  const raceName = getNameById(races as unknown as { id: string; name: string }[], state.race) ?? state.race ?? '—'
  const alignmentName = getAlignmentName(state.alignment)

  const filledClasses = state.classes.filter((cls) => cls.classId)
  const isMulticlass = filledClasses.length > 1
  const classLines = filledClasses.map((cls, i) =>
    getClassLine(cls, classes, i === 0, isMulticlass),
  )

  const equipmentCount =
    (state.equipment?.weapons?.length ?? 0) +
    (state.equipment?.armor?.length ?? 0) +
    (state.equipment?.gear?.length ?? 0)

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <CheckCircleIcon color="success" />
        <Typography variant="h5" fontWeight={700}>
          Review Your Character
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your selections below. Click <strong>Edit</strong> on any card to make changes, or press <strong>Generate Character</strong> when ready.
      </Typography>

      <Stack spacing={1.5}>
        {/* Name */}

        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', letterSpacing: '0.08em' }}>
          Character Name
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Optional — will be generate"
          value={state.name ?? ''}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 0.5 }}
        />
  

        {/* Edition */}
        <SummaryCard
          label="Edition"
          stepId="edition"
          filled={!!state.edition}
          onEdit={goToStep}
          value={
            <Typography variant="body1" fontWeight={600}>
              {editionName}
            </Typography>
          }
        />

        {/* Setting */}
        <SummaryCard
          label="Setting"
          stepId="setting"
          filled={!!state.setting}
          onEdit={goToStep}
          value={
            <Typography variant="body1" fontWeight={600}>
              {settingName}
            </Typography>
          }
        />

        {/* Race */}
        <SummaryCard
          label="Race"
          stepId="race"
          filled={!!state.race}
          onEdit={goToStep}
          value={
            <Typography variant="body1" fontWeight={600}>
              {raceName}
            </Typography>
          }
        />

        {/* Level */}
        <SummaryCard
          label="Level"
          stepId="level"
          filled={!!state.totalLevel}
          onEdit={goToStep}
          value={
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1" fontWeight={600}>
                Level {state.totalLevel || '—'}
              </Typography>
              {state.xp > 0 && (
                <Chip label={`${state.xp.toLocaleString()} XP`} size="small" variant="outlined" />
              )}
            </Stack>
          }
        />

        {/* Classes */}
        <SummaryCard
          label="Class"
          stepId="class"
          filled={classLines.length > 0}
          onEdit={goToStep}
          value={
            classLines.length > 0 ? (
              <Box>
                {classLines.map((line, i) => (
                  <Typography key={i} variant="body1" fontWeight={600}>
                    {line}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">—</Typography>
            )
          }
        />

        {/* Alignment */}
        <SummaryCard
          label="Alignment"
          stepId="alignment"
          filled={!!state.alignment}
          onEdit={goToStep}
          value={
            <Typography variant="body1" fontWeight={600}>
              {alignmentName}
            </Typography>
          }
        />

        {/* Equipment */}
        <SummaryCard
          label="Equipment"
          stepId="equipment"
          filled={equipmentCount > 0}
          onEdit={goToStep}
          value={
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body1" fontWeight={600}>
                {equipmentCount} item{equipmentCount !== 1 ? 's' : ''}
              </Typography>
              {(state.equipment?.weight ?? 0) > 0 && (
                <Chip label={`${state.equipment?.weight} lbs`} size="small" variant="outlined" />
              )}
              {(state.wealth?.gp ?? 0) > 0 && (
                <Chip label={`${state.wealth?.gp} gp remaining`} size="small" variant="outlined" color="warning" />
              )}
            </Stack>
          }
        />
      </Stack>
    </Box>
  )
}

export default ConfirmationStep
