import { useEffect, useState, useMemo } from 'react'
import { races, editions, campaigns, classes, type EditionType } from '@/data'
import {
  getById, 
  getClassChoicesForEdition, 
  getClassOptions, 
  getNameById,
  getRaceOptions 
} from '@/helpers'

export type FormValues = {
  alignment: string
  campaign: string
  characterClass: string
  characterSubclass: string
  edition: EditionType
  level: string
  race: string
}

type FormProps = {
  onSubmit: (values: FormValues) => void
  loading: boolean
}

type SelectOptionMap = Record<string, { name: string } | string>

type SelectField = {
  label: string
  value: string
  setValue: (val: any) => void
  options?: SelectOptionMap
  disabled?: boolean
}


const preserveOrDefault = <T extends { id: string }>(
  current: string | undefined,
  options?: T[]
): string | undefined => {
  if (!options || options.length === 0) return undefined

  // Only one option → automatically select it
  if (options.length === 1) return options[0].id

  // Otherwise preserve current selection if valid
  if (current && options.some(opt => opt.id === current)) return current

  return undefined
}

const Form = ({ onSubmit, loading }: FormProps) => {
  const DEFAULT_EDITION: EditionType = '5'
  const [edition, setEdition] = useState<EditionType | undefined>(DEFAULT_EDITION)
  const [characterClass, setCharacterClass] = useState<keyof typeof classes | undefined>()
  const [characterSubclass, setCharacterSubclass] = useState<string | undefined>()
  const [campaign, setCampaign] = useState(() => {
    const initialEdition = editions.find(e => e.id === DEFAULT_EDITION)
    return initialEdition?.campaigns?.[0] || undefined
  })
  const [race, setRace] = useState('')
  const [alignment, setAlignment] = useState('')
  const [level, setLevel] = useState<string | ''>('1')

  const editionData = useMemo(
    () => getById(editions, edition),
    [edition]
  )

  const selectedCampaignObj = getById(campaigns, campaign) 
  
  const classChoices = characterClass
    ? getClassChoicesForEdition(
        characterClass,
        edition,
        selectedCampaignObj?.classOverrides
      )
    : null

  const campaignOptions = useMemo(() => {
    if (!editionData?.campaigns) return []

    return editionData.campaigns
      .map(campaignId => getById(campaigns, campaignId))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
  }, [editionData])

  const raceOptions = useMemo(() => {
    if (!edition) return []

    // returns ['human', 'elf', 'gladiator', ...]
    const raceIds = getRaceOptions(edition, campaign)

    return raceIds
      .map(raceId => races.find(r => r.id === raceId))
      .filter(Boolean)
  }, [edition, campaign, races])
  
  const classOptions = useMemo(
    () => getClassOptions(edition, campaign),
    [edition, campaign]
  )

  const alignmentOptions = useMemo(() => {
    return editionData?.alignments ?? {}
  }, [editionData])

  const levelOptions = Array.from({ length: 20 }, (_, i) => {
    const level = i + 1

    return {
      id: String(level),
      name: `Level ${level}`
    }
  })

  // Consolidate all your sync effects into this one:
  useEffect(() => {
    if (!editionData) return

    // Sync Campaign
    setCampaign(prev => {
      // If we have a value and it's valid, keep it
      if (prev && campaignOptions.some(opt => opt.id === prev)) return prev
      
      // Otherwise, default to the first available campaign in this edition
      return campaignOptions[0]?.id
    })

    // Sync Class
    setCharacterClass(prev => preserveOrDefault(prev, classOptions))
    
    // Sync Alignment
    setAlignment(prev => preserveOrDefault(prev, alignmentOptions))
  }, [editionData, campaignOptions, classOptions, alignmentOptions])

  // Sync Race separately because it depends on the Campaign result above
  useEffect(() => {
    setRace(prev => preserveOrDefault(prev, raceOptions))
  }, [raceOptions])

  const selectFields: SelectField[] = [
    {
      label: 'Campaign',
      value: campaign,
      setValue: setCampaign,
      options: campaignOptions,
      disabled: !edition
    },
    {
      label: 'Race',
      value: race,
      setValue: setRace,
      options: raceOptions,
      //disabled: !campaign
    },
    {
      label: 'Class',
      value: characterClass,
      setValue: setCharacterClass,
      // options: getClassOptions(edition),
      options: classOptions,
      disabled: !edition
    }
  ]

  if (classChoices) {
    selectFields.push({
      label: classChoices.label,
      value: characterSubclass,
      setValue: setCharacterSubclass,
      options: classChoices.options,
      disabled: !characterClass
    })
  }

  selectFields.push(
    {
      label: 'Alignment',
      value: alignment,
      setValue: setAlignment,
      options: alignmentOptions,
      disabled: !edition
    },
    {
      label: 'Level',
      value: level,
      setValue: setLevel,
      options: levelOptions,
      disabled: false
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      edition: getNameById(editions, edition),
      campaign: getNameById(campaigns, campaign),
      race: getNameById(races, race),
      class: getNameById(Object.values(classes), characterClass),
      subclass: characterSubclass, // TODO: send name instead of id
      alignment: getNameById(editionData?.alignments ?? [], alignment),
      level
    })
  }

  // console.log('selectFields', selectFields)
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Edition */}
      <select value={edition} onChange={e => setEdition(e.target.value as EditionType)}>
        {editions.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>

      {/* Map over selectFields */}
      {selectFields.map(field => (
        <select
          key={field.label}
          name={field.label}
          value={field.value}
          onChange={e => field.setValue(e.target.value)}
          disabled={field.disabled}
        >
          {/* Only show placeholder if more than one option */}
          {Array.isArray(field.options) && field.options.length > 1 && (
            <option value="">Any {field.label}</option>
          )}

          {Array.isArray(field.options) &&
            field.options.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
        </select>
      ))}
      <button type="submit" disabled={loading}>
        {loading ? 'Loading…' : 'Submit'}
      </button>
    </form>
  )
}

export default Form
