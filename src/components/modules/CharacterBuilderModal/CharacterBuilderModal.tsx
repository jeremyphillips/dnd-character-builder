import { useCharacterBuilder } from '@/characterBuilder'
import { STEP_CONFIG } from '@/characterBuilder'
import './CharacterBuilderModal.css'

const CharacterBuilderModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { state, nextStep, prevStep, isComplete } = useCharacterBuilder()

  if (!isOpen) return null;

  // Find the index of the current step from the provider
  const currentStepIndex = STEP_CONFIG.findIndex(step => step.id === state.step.id);
  const currentStep = STEP_CONFIG[currentStepIndex];
  const StepComponent = currentStep.component;

  // Disable "Next" if the selector for the current step returns falsy
  const isNextDisabled = !currentStep.selector(state);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-content-inner">
          <StepComponent />

          <div className="modal-footer">
            {currentStepIndex > 0 && <button onClick={prevStep}>Back</button>}

            {currentStepIndex < STEP_CONFIG.length - 1 && (
              <button onClick={nextStep} disabled={isNextDisabled}>
                Next
              </button>
            )}

            {currentStepIndex === STEP_CONFIG.length - 1 && (
              <button onClick={onClose} disabled={!isComplete}>
                Finish
              </button>
            )}
          </div>
        </div>  
      </div>
    </div>
  );
};

export default CharacterBuilderModal;
