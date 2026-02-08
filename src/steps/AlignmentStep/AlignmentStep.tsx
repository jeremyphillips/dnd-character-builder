import { useCharacterBuilder } from '@/characterBuilder'
// import { editions } from '@/data'
import { ButtonGroup } from '@/components/elements'
import { getAlignmentsByEdition } from '@/helpers'

const AlignmentStep = () => {
  const { state, setAlignment } = useCharacterBuilder()
  const { 
    alignment: selectedAlignment, 
    classes: selectedClasses,
    edition: selectedEdition,
    step
  } = state

  const alignments = getAlignmentsByEdition(selectedEdition)
  return (
    <>
      <h2>Choose {step.name}</h2>
      <ButtonGroup
        options={alignments.map(a => ({
          id: a.id,
          label: a.name
        }))}
        value={selectedAlignment}
        onChange={setAlignment}
      />
    </>
  )
}

export default AlignmentStep
