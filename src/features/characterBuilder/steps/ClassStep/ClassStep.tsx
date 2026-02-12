import { useEffect } from 'react'
import { useCharacterBuilder } from '@/characterBuilder/context'
import { classes } from '@/data'
import { getOptions } from '@/domain/options'
import {
  getClassDefinitions,
  getSubclassUnlockLevel,
  meetsClassRequirements
} from '@/domain/character'
import { ButtonGroup } from '@/ui/elements'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const ClassStep = () => {
  const {
    state,
    allocatedLevels,
    setActiveClassIndex,
    setClassId,
    addClass,
    updateClassLevel,
    removeClass,
    updateClassDefinition,
    allocateRemainingLevels
  } = useCharacterBuilder()  

  const {
    step,
    edition,
    setting,
    classes: selectedClasses,
    activeClassIndex,
    totalLevel
  } = state

  useEffect(() => {
    if (selectedClasses[0]?.classId === undefined && activeClassIndex !== 0) {
      setActiveClassIndex(0)
    }
  }, [selectedClasses[0]?.classId, activeClassIndex, setActiveClassIndex])

  const activeClass =
    typeof activeClassIndex === 'number'
      ? selectedClasses[activeClassIndex]
      : null

  const remainingLevels = totalLevel - allocatedLevels

  /* ---------- Primary class options ---------- */
  const allowedClassIds = getOptions('classes', edition, setting)

  const classOptions = allowedClassIds
    .map(id => classes.find(c => c.id === id))
    .filter(Boolean)
    .map(cls => {
      const { allowed } = meetsClassRequirements(cls!, state)
      return {
        id: cls!.id,
        label: cls!.name,
        disabled: !allowed
      }
    })

  const primaryClassSelected = Boolean(selectedClasses[0]?.classId)

  return (
    <div>
      <header>
        <h2>Choose {step.name}</h2>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Allocate your {totalLevel} total level{totalLevel > 1 ? 's' : ''} across one or more classes.
        </Typography>
        <Typography variant="body2">
          <strong>Levels Allocated:</strong> {allocatedLevels} / {totalLevel}
          {remainingLevels > 0 && (
            <>
              {' — '}
              <Typography component="span" variant="body2" color="text.secondary">
                {remainingLevels} level{remainingLevels > 1 ? 's' : ''} remaining
              </Typography>
            </>
          )}
        </Typography>
        {remainingLevels === 0 && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
            <CheckCircleIcon color="success" fontSize="small" />
            <Typography variant="body2" color="success.main">All levels allocated</Typography>
          </Stack>
        )}
      </header>

      <Stack spacing={1.5} sx={{ mt: 3 }}>
        {selectedClasses.map((cls, index) => {
          const isActive = activeClass && index === activeClassIndex
          const isPrimary = index === 0

          const subclassUnlockLevel = getSubclassUnlockLevel(cls.classId, edition)
          const canChooseSubclass =
            cls.classId &&
            subclassUnlockLevel &&
            cls.level >= subclassUnlockLevel

          const definitions = canChooseSubclass
            ? getClassDefinitions(cls.classId, edition, cls.level)
            : []

          const subclassOptions = definitions.flatMap((d: { options: { id: string; name: string }[] }) =>
            d.options.map((opt: { id: string; name: string }) => ({
              id: opt.id,
              label: opt.name
            }))
          )

          return (
            <Card
              key={index}
              variant="outlined"
              sx={{
                width: '100%',
                transition: 'height 0.3s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                ...(isActive && {
                  borderColor: 'var(--mui-palette-primary-main)',
                  bgcolor: 'var(--mui-palette-action-hover)',
                }),
              }}
            >
              <CardContent sx={{ pb: isActive ? 0 : undefined }}>
                {/* Card header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Chip
                      label={isPrimary ? 'Primary Class' : 'Secondary Class'}
                      size="small"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                      {cls.classId || 'Choose a class'}
                      {cls.classDefinitionId && ` — ${cls.classDefinitionId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Level {cls.level}
                    </Typography>
                  </Box>

                  {!isActive && (
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="medium"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => setActiveClassIndex(index)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="medium"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => removeClass(index)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>

              {/* Expanded editor */}
              {isActive && (
                <>
                  <CardContent>
                    {/* Class selection */}
                    <ButtonGroup
                      options={classOptions.map(opt => {
                        const primaryClassId = selectedClasses[0]?.classId
                        const disabled =
                          index !== 0 && opt.id === primaryClassId

                        return { ...opt, disabled }
                      })}
                      value={cls.classId}
                      onChange={id => setClassId(id)}
                      autoSelectSingle
                    />

                    {/* Level spinner */}
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 3 }}>
                      <IconButton
                        size="medium"
                        disabled={cls.level <= 1}
                        onClick={() => updateClassLevel(index, cls.level - 1)}
                        color="primary"
                      >
                        <RemoveIcon />
                      </IconButton>

                      <TextField
                        value={cls.level}
                        size="small"
                        type="number"
                        slotProps={{
                          input: {
                            readOnly: true,
                            sx: { textAlign: 'center', width: 72 },
                          },
                          htmlInput: {
                            min: 1,
                            max: totalLevel,
                            style: { textAlign: 'center' },
                          },
                        }}
                        label="Level"
                      />

                      <IconButton
                        size="medium"
                        disabled={remainingLevels <= 0}
                        onClick={() => updateClassLevel(index, cls.level + 1)}
                        color="primary"
                      >
                        <AddIcon />
                      </IconButton>

                      <Button
                        variant="text"
                        size="small"
                        onClick={allocateRemainingLevels}
                        disabled={remainingLevels <= 0}
                      >
                        Allocate remaining
                      </Button>
                    </Stack>

                    {/* Subclass */}
                    {subclassOptions.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Subclass</Typography>
                        <ButtonGroup
                          options={subclassOptions}
                          value={cls.classDefinitionId}
                          onChange={id =>
                            updateClassDefinition(index, id)
                          }
                          autoSelectSingle
                          size="sm"
                        />
                      </>
                    )}

                    {!canChooseSubclass && cls.classId && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Subclass unlocks at level {subclassUnlockLevel}
                      </Typography>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          )
        })}
      </Stack>

      {/* Add class */}
      {primaryClassSelected &&
        selectedClasses.length < 2 &&
        selectedClasses.length < totalLevel && (
        <CardActions sx={{ px: 0, pt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addClass}
          >
            Add another class
          </Button>
        </CardActions>
      )}
    </div>
  )
}

export default ClassStep
