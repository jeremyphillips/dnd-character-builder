import { useCharacterBuilder } from '@/characterBuilder'
import { classes } from '@/data'
import { getOptions, getClassDefinitions, meetsClassRequirements } from '@/helpers'
import { ButtonGroup } from '@/components/elements'

const ClassStep = () => {
  const {
    state,
    setClassId,
    setClassDefinitionId,
    addClass
  } = useCharacterBuilder()

  const {
    step,
    edition,
    classes: selectedClasses,
    campaign: campaignId,
    totalLevels
  } = state

  const activeIndex = state.activeClassIndex ?? 0
  const activeClass = selectedClasses[activeIndex]
  
  if (!activeClass) return null
  
  const {
    classId: selectedClassId,
    classDefinitionId: selectedClassDefinitionId,
    level: selectedLevel
  } = activeClass ?? {}

  // Primary class options
  const allowedClassIds = getOptions('classes', edition, campaignId)
  const allowedClasses = allowedClassIds
    .map(id => classes.find(c => c.id === id))
    .filter(Boolean)
    .map(cls => {
      const { allowed } = meetsClassRequirements(cls, state)
      return { id: cls!.id, label: cls!.name, disabled: !allowed }
    })

  // Secondary definitions (only after class is selected)
  const definitions = getClassDefinitions(
    selectedClassId,
    edition,
    totalLevels
  )

  const definitionOptions = definitions.flatMap(d =>
    d.options.map(opt => ({
      id: opt.id,
      label: opt.name
    }))
  )

  return (
    <div>
      <h2>Choose {step.name}</h2>
      <ButtonGroup
        options={allowedClasses}
        value={selectedClassId} 
        onChange={setClassId}
        autoSelectSingle
      />

      {/* Definition (subclass) selection */}
      {definitionOptions.length > 0 && (
        <>
          <h4>{definitions[0].name}</h4>
          {/* {definitions[0]?.selectionLevel &&
            <small><em>Available at level {definitions[0].selectionLevel}</em></small>
          } */}
          <ButtonGroup
            options={definitionOptions}
            value={selectedClassDefinitionId}
            onChange={setClassDefinitionId}
            autoSelectSingle
            size='sm'
          />
        </>
      )}

      {state.classes.length < totalLevels && (
        <button onClick={addClass}>
          Add Another Class
        </button>
      )}
    </div>
  )
}

export default ClassStep
