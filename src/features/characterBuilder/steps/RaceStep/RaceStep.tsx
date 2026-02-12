import { useCharacterBuilder } from '@/characterBuilder/context'
import type { EditionId, SettingId } from '@/data'
import { ButtonGroup } from '@/ui/elements'
import { getAllowedRaces } from '@/domain/character/races'

const RaceStep = () => {
  const { state, setRace } = useCharacterBuilder()
  const { step, edition, setting, race: selectedRace } = state

  const allowedRaces = getAllowedRaces(edition as EditionId, setting as SettingId)

  return (
    <>
      <h2>Choose {step.name}</h2>
      <ButtonGroup
        options={allowedRaces.map(race => ({
          id: race.id,
          label: race.name
        }))}
        value={selectedRace}
        onChange={setRace}
      />
    </>
  )
}

export default RaceStep
