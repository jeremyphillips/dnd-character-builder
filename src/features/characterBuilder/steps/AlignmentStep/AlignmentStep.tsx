import { useCharacterBuilder } from '@/features/characterBuilder/context'
import { InvalidationNotice } from '@/features/characterBuilder/components'
import type { EditionId } from '@/data'
import { ButtonGroup } from '@/ui/elements'
import { getAlignmentOptionsForCharacter } from '@/features/character/domain/reference'

const AlignmentStep = () => {
  const { state, setAlignment, stepNotices, dismissNotice } = useCharacterBuilder()
  const {
    alignment: selectedAlignment,
    classes: selectedClasses,
    edition: selectedEdition,
    step
  } = state

  const classIds = selectedClasses.map((c) => c.classId).filter(Boolean) as string[]
  const allowedAlignmentOptions = getAlignmentOptionsForCharacter(selectedEdition as EditionId | undefined, classIds)
  const notices = stepNotices.get('alignment') ?? []

  return (
    <>
      <h2>Choose {step.name}</h2>
      <InvalidationNotice items={notices} onDismiss={() => dismissNotice('alignment')} />
      <ButtonGroup
        options={allowedAlignmentOptions}
        value={selectedAlignment}
        onChange={setAlignment}
      />
    </>
  )
}

export default AlignmentStep
