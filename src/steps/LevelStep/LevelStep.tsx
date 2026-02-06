import { useCharacterBuilder } from '@/characterBuilder'
import { ButtonGroup } from '@/components/elements'

const LEVEL_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1)

const LevelStep = () => {
  const { state, setTotalLevels } = useCharacterBuilder()
  const { 
    step,
    totalLevels: selectedTotalLevel
  } = state

  return (
    <>
      <h2>Choose {step.name}</h2>
      <ButtonGroup
        options={LEVEL_OPTIONS.map(level => ({
          id: level,
          label: `Level ${level.toString()}`
        }))}
        value={selectedTotalLevel}
        onChange={setTotalLevels}
      />
    </>
  )
}

export default LevelStep
