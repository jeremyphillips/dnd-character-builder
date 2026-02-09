import { useCharacterBuilder } from '@/characterBuilder/context'
import type { EditionId } from '@/data'
import { ButtonGroup } from '@/components/elements'
import { getAlignmentOptions } from '@/helpers'

const AlignmentStep = () => {
  const { state, setAlignment } = useCharacterBuilder()
  const {
    alignment: selectedAlignment,
    classes: selectedClasses,
    edition: selectedEdition,
    step
  } = state

  const classIds = selectedClasses.map((c) => c.classId).filter(Boolean) as string[]
  const alignmentOptions = getAlignmentOptions(
    selectedEdition as EditionId | undefined,
    classIds
  )

  return (
    <>
      <h2>Choose {step.name}</h2>
      <ButtonGroup
        options={alignmentOptions}
        value={selectedAlignment}
        onChange={setAlignment}
      />
    </>
  )
}

export default AlignmentStep
