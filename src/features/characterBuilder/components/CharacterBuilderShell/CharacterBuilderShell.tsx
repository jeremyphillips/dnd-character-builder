import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

import { AppModal } from '@/ui/modals'
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
      <AppModal
        open={isOpen}
        onClose={onClose ?? (() => {})}
        size="full"
        showCloseButton={!!onClose && !isGenerating}
        closeOnBackdropClick={!isGenerating}
        closeOnEsc={!isGenerating}
        loading={isGenerating}
        actions={
          <>
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
          </>
        }
      >
        <StepComponent />
      </AppModal>

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
