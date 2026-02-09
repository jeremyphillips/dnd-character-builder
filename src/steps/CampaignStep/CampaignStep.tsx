import { useCharacterBuilder } from '@/characterBuilder'
import { campaigns, editions } from '@/data'
import { ButtonGroup } from '@/components/elements'
import { getById } from '@/helpers'

const CampaignStep = () => {
  const { state, setCampaign } = useCharacterBuilder()
  const { step, edition, campaign: selectedCampaign } = state

  // Find the edition object
  const editionData = edition ? getById(editions, edition) : undefined

  // Only include campaigns allowed by the edition
  const allowedCampaigns = editionData?.campaigns
    .map(id => campaigns.find(c => c.id === id))
    .filter(Boolean) ?? []

  return (
    <>
      <h2>Choose {step.name}</h2>
      <ButtonGroup
        options={allowedCampaigns.map(e => ({
          id: e.id,
          label: e.name
        }))}
        value={selectedCampaign}
        onChange={setCampaign}
      />
    </>

  )
}

export default CampaignStep
