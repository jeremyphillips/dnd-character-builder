import { useCharacterBuilder } from '@/characterBuilder/context'
import { editions } from '@/data'
import { ButtonGroup } from '@/ui/elements'

const EditionStep = () => {
  const { state, setEdition } = useCharacterBuilder()
  const { step, edition: selectedEdition } = state

  return (
    <>
      <h2>Choose {step.name}</h2>
      <ButtonGroup
        options={editions.map(e => ({
          id: e.id,
          label: e.name
        }))}
        value={selectedEdition}
        onChange={setEdition}
      />
    </>
  )
}

export default EditionStep
