import { useCharacterBuilder } from '@/characterBuilder/context'
import { settings, editions } from '@/data'
import { ButtonGroup } from '@/components/elements'
import { getById } from '@/helpers'

const SettingStep = () => {
  const { state, setSetting } = useCharacterBuilder()
  const { step, edition, setting: selectedSetting } = state

  // Find the edition object
  const editionData = edition ? getById(editions, edition) : undefined

  // Only include settings allowed by the edition
  const allowedSettings = editionData?.settings
    .map(id => settings.find(c => c.id === id))
    .filter(Boolean) ?? []

  return (
    <>
      <h2>Choose {step.name}</h2>
      <ButtonGroup
        options={allowedSettings.map(e => ({
          id: e.id,
          label: e.name
        }))}
        value={selectedSetting}
        onChange={setSetting}
      />
    </>

  )
}

export default SettingStep
