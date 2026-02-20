import { useCharacterBuilder } from '@/features/characterBuilder/context'
import { InvalidationNotice } from '@/features/characterBuilder/components'
import type { EditionId, SettingId } from '@/data'
import { ButtonGroup } from '@/ui/elements'
import { getAllowedRaces } from '@/features/character/domain/validation'

const RaceStep = () => {
  const { state, setRace, stepNotices, dismissNotice } = useCharacterBuilder()
  const { step, edition, setting, race: selectedRace } = state

  const allowedRaces = getAllowedRaces(edition as EditionId, setting as SettingId)
  const notices = stepNotices.get('race') ?? []

  return (
    <>
      <h2>Choose {step.name}</h2>
      <InvalidationNotice items={notices} onDismiss={() => dismissNotice('race')} />
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
