import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

import { useCharacterBuilder } from '../../context'
import { getStepConfig } from '../../constants'
import InvalidationConfirmDialog from '../InvalidationConfirmDialog/InvalidationConfirmDialog'

type CharacterBuilderShellProps = {
  isOpen: boolean
  onClose?: () => void
  onGenerate: () => void
  isGenerating?: boolean
}

const CharacterBuilderShell = ({ isOpen, onClose, onGenerate, isGenerating = false }: CharacterBuilderShellProps) => {
  const {
    state,
    nextStep,
    prevStep,
    pendingInvalidations,
    confirmChange,
    cancelChange,
  } = useCharacterBuilder()

  const stepConfig = getStepConfig(state.type ?? 'pc')
  const currentStepIndex = Math.max(0, stepConfig.findIndex(step => step.id === state.step.id))
  const currentStep = stepConfig[currentStepIndex]
  const StepComponent = currentStep.component
  const isNextDisabled = !currentStep.selector(state)
  const isLastStep = currentStepIndex === stepConfig.length - 1

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={isGenerating ? undefined : onClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              maxHeight: '90vh',
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogContent sx={{ pb: 10, opacity: isGenerating ? 0.4 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
          <StepComponent />
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid var(--mui-palette-divider)', px: 3, py: 2 }}>
          {currentStepIndex > 0 && (
            <Button onClick={prevStep} variant="outlined" color="secondary" disabled={isGenerating}>
              Back
            </Button>
          )}

          {!isLastStep && (
            <Button onClick={nextStep} disabled={isNextDisabled || isGenerating} variant="contained">
              Next
            </Button>
          )}

          {isLastStep && (
            <Button
              onClick={onGenerate}
              variant="contained"
              color="primary"
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              {isGenerating ? 'Generating…' : 'Generate Character'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Invalidation confirmation dialog — renders above the builder */}
      <InvalidationConfirmDialog
        invalidations={pendingInvalidations}
        onConfirm={confirmChange}
        onCancel={cancelChange}
      />
    </>
  )
}

export default CharacterBuilderShell
