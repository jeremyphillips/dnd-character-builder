import { useCharacterBuilder } from '@/characterBuilder'
import { races } from '@/data'
import { getOptions } from '@/helpers'
import { ButtonGroup } from '@/components/elements'

const RaceStep = () => {
  const { state, setRace } = useCharacterBuilder()
  const { step, edition, campaign, race: selectedRace } = state

  const allowedRaceIds = getOptions('races', edition, campaign)

  const allowedRaces = allowedRaceIds
    .map(id => races.find(r => r.id === id))
    .filter(Boolean)

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
