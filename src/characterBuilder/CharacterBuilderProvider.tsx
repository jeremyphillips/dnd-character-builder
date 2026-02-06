import { useMemo, useEffect, useState } from "react"
import CharacterBuilderContext from './CharacterBuilderContext'
import type { CharacterBuilderState } from './characterBuilder.types'
import { getById, getOptions } from "@/helpers"
import { races } from "@/data"
import {
  STEP_CONFIG, 
  INITIAL_CHARACTER_BUILDER_STATE, 
  type CharacterClassInfo 
} from "@/characterBuilder"

export const CharacterBuilderProvider = ({ children }) => {
  const [state, setState] = useState<CharacterBuilderState>(
    INITIAL_CHARACTER_BUILDER_STATE
  )

  useEffect(() => {
    //console.groupCollapsed('🧙 Character Builder State')
    console.log(state)
    //console.groupEnd()
  }, [state])

  const raceOptions = useMemo(() => {
    if (!state.edition) return []
    const ids = getOptions('races', state.edition, state.campaign)
    return ids.map(id => getById(races, id)).filter(Boolean)
  }, [state.edition, state.campaign])

  const classOptions = useMemo(() => {
    if (!state.edition) return []
    return getOptions('classes', state.edition, state.campaign)
  }, [state.edition, state.campaign])

  const updateState = (
    updater: (state: CharacterBuilderState) => CharacterBuilderState
  ) => setState(updater)

  const setEdition = (edition: string) =>
    updateState(s => ({ ...s, edition }))

  const setCampaign = (campaign: string) =>
    updateState(s => ({ ...s, campaign }))

  const setRace = (race: string) =>
    updateState(s => ({ ...s, race }))

  const updateActiveClass = (
    updater: (cls: CharacterClassInfo) => CharacterClassInfo
  ) =>
    setState(s => {
      const index = s.activeClassIndex
      const classes = [...s.classes]

      classes[index] = updater(classes[index])

      return { ...s, classes }
    })

  const setClassId = (classId: string) =>
    updateActiveClass(cls => ({ ...cls, classId }))

  const setClassDefinitionId = (classDefinitionId: string) =>
    updateActiveClass(cls => ({ ...cls, classDefinitionId }))
  
  const setClassLevel = (level: number) =>
    updateActiveClass(cls => ({ ...cls, level }))

  const addClass = () =>
    setState(s => {
      const newClass: CharacterClassInfo = { level: 1 }

      return {
        ...s,
        classes: [...s.classes, newClass],
        activeClassIndex: s.classes.length
      }
    })


  const setTotalLevels = (totalLevels: number) =>
    updateState(s => ({ ...s, totalLevels }))

  const setAlignment = (alignment: string) =>
    updateState(s => ({ ...s, alignment }))

  const setWeapons = (weapons: string[]) =>
    updateState(s => ({
      ...s,
      equipment: { ...s.equipment, weapons }
    }))

  const setArmor = (armor: string[]) =>
    updateState(s => ({
      ...s,
      equipment: { ...s.equipment, armor }
    }))

  const getStepByIndex = (index: number) => {
    const step = STEP_CONFIG[Math.max(0, Math.min(index, STEP_CONFIG.length - 1))]
    return { id: step.id, name: step.label }
  }

  const getCurrentStepIndex = (stepId?: string) => 
    STEP_CONFIG.findIndex(step => step.id === stepId)

  const start = () =>
    updateState(s => ({ ...s, step: getStepByIndex(0) }))

  const nextStep = () =>
    updateState(s => ({
      ...s,
      step: getStepByIndex(getCurrentStepIndex(s.step?.id) + 1)
    }))

  const prevStep = () =>
    updateState(s => ({
      ...s,
      step: getStepByIndex(getCurrentStepIndex(s.step?.id) - 1)
    }))

  const isComplete = (state: CharacterBuilderState) =>
    STEP_CONFIG.every(step => step.selector(state))

  return (
    <CharacterBuilderContext.Provider
      value={{
        state,
        setEdition,
        setCampaign,
        setRace,
        setClassId,
        setClassDefinitionId,
        setClassLevel,
        addClass,
        setWeapons,
        setArmor,
        setAlignment,
        setTotalLevels,
        start,
        nextStep,
        prevStep,
        isComplete,
        raceOptions,
        classOptions
      }}
    >
      {children}
    </CharacterBuilderContext.Provider>
  )
}
