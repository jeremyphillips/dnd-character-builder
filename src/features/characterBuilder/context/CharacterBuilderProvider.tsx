import { useMemo, useEffect, useState, type PropsWithChildren } from "react"
import CharacterBuilderContext from './CharacterBuilderContext'
import type { CharacterBuilderState, CharacterClassInfo } from '../types'
import type { Proficiency } from '@/shared/types/character.core'
import {
  getStepConfig,
  createInitialBuilderState
} from '../constants'
import { getById } from '@/domain/lookups'
import { getOptions } from '@/domain/options'
import {
  getSubclassUnlockLevel,
  getXpByLevelAndEdition
} from '@/domain/character'
import {
  calculateEquipmentWeight,
  calculateEquipmentCost
} from '@/domain/equipment'
import { races, equipment } from "@/data"
import type { CharacterType } from "@/shared/types/character.core"

const {
  weapons: weaponsData,
  armor: armorData,
  gear: gearData
} = equipment

export const CharacterBuilderProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<CharacterBuilderState>(
    () => createInitialBuilderState('pc')
  )

  useEffect(() => {
    //console.groupCollapsed('🧙 Character Builder State')
    console.log(state)
    //console.groupEnd()
  }, [state])

  const raceOptions = useMemo(() => {
    if (!state.edition) return []
    const ids = getOptions('races', state.edition, state.setting)
    return ids.map(id => getById(races, id)).filter(Boolean)
  }, [state.edition, state.setting])

  const classOptions = useMemo(() => {
    if (!state.edition) return []
    return getOptions('classes', state.edition, state.setting)
  }, [state.edition, state.setting])

  const updateState = (
    updater: (state: CharacterBuilderState) => CharacterBuilderState
  ) => setState(updater)

  const setCharacterType = (type: CharacterType) =>
    updateState(s => ({ ...s, type }))

  const openBuilder = (
    mode: CharacterType,
    campaignEdition?: string,
    campaignSetting?: string
  ) => {
    setState(createInitialBuilderState(mode, campaignEdition, campaignSetting))
  }


  const setName = (name: string) =>
    updateState(s => ({ ...s, name }))

  const setEdition = (edition: string) =>
    updateState(s => ({ ...s, edition }))

  const setSetting = (setting: string) =>
    updateState(s => ({ ...s, setting }))

  const setRace = (race: string) =>
    updateState(s => ({ ...s, race }))

  const updateActiveClass = (
    updater: (cls: CharacterClassInfo) => CharacterClassInfo
  ) =>
    setState(s => {
      const index = s.activeClassIndex

      if (index == null || !s.classes[index]) return s

      const classes = [...s.classes]
      classes[index] = updater(classes[index])

      return { ...s, classes }
    })

  const setClassId = (classId: string) =>
    updateActiveClass(cls => ({ ...cls, classId }))

  const setClassDefinitionId = (classDefinitionId: string) =>
    updateActiveClass(cls => ({ ...cls, classDefinitionId }))

  const setClassLevel = (index: number, level: number) =>
    setState(s => {
      const classes = [...s.classes]
      const current = classes[index]

      if (!current) return s

      const nextLevel = Math.max(1, level)

      const currentAllocated =
        s.classes.reduce((sum, cls, i) =>
          i === index ? sum : sum + (cls.level ?? 0), 0)

      if (currentAllocated + nextLevel > s.totalLevel) {
        return s // reject change
      }

      classes[index] = {
        ...current,
        level: nextLevel
      }

      return { ...s, classes }
    })

  const updateClassLevel = (index: number, level: number) =>
    updateState(s => {
      const cls = s.classes[index]
      if (!cls || level < 1) return s

      const otherLevels = s.classes.reduce(
        (sum, c, i) => (i === index ? sum : sum + c.level),
        0
      )

      if (otherLevels + level > s.totalLevel) return s

      const unlockLevel = getSubclassUnlockLevel(
        cls.classId,
        s.edition
      )

      const classDefinitionId =
        unlockLevel && level < unlockLevel
          ? undefined
          : cls.classDefinitionId

      const classes = [...s.classes]
      classes[index] = {
        ...cls,
        level,
        classDefinitionId
      }

      return { ...s, classes }
    })

  const allocateRemainingLevels = () => {
    setState(s => {
      const index = s.activeClassIndex
      if (index == null) return s // nothing active

      const allocatedLevels = s.classes.reduce(
        (sum, cls) => sum + (cls.level ?? 0),
        0
      )
      const remaining = s.totalLevel - allocatedLevels
      if (remaining <= 0) return s // nothing to allocate

      const updatedClasses = [...s.classes]
      updatedClasses[index] = {
        ...updatedClasses[index],
        level: (updatedClasses[index].level ?? 0) + remaining
      }

      return { ...s, classes: updatedClasses }
    })
  }

  const isEmptySecondaryClass = (cls: CharacterClassInfo, index: number) =>
    index > 0 &&
    !cls.classId &&
    !cls.classDefinitionId &&
    cls.level === 1

  const setActiveClassIndex = (index: number | null) => {
    setState(prev => {
      const classes = [...prev.classes]

      const cleanedClasses = classes.filter(
        (cls, i) => !isEmptySecondaryClass(cls, i)
      )

      return {
        ...prev,
        classes: cleanedClasses,
        activeClassIndex:
          index == null
            ? null
            : Math.min(index, cleanedClasses.length - 1)
      }
    })
  }


  const updateClassDefinition = (index: number, subclassId?: string) =>
    updateState(s => {
      const cls = s.classes[index]
      if (!cls) return s

      const unlockLevel = getSubclassUnlockLevel(
        cls.classId,
        s.edition
      )

      // Cannot set subclass before unlock
      if (subclassId && unlockLevel && cls.level < unlockLevel) {
        return s
      }

      const classes = [...s.classes]
      classes[index] = {
        ...cls,
        classDefinitionId: subclassId
      }

      return { ...s, classes }
    })

  const addClass = () =>
    setState(s => {
      const allocated = s.classes.reduce(
        (sum, cls) => sum + (cls.level ?? 0),
        0
      )

      if (allocated >= s.totalLevel) return s

      const newClass: CharacterClassInfo = {
        level: 1
      }

      return {
        ...s,
        classes: [...s.classes, newClass],
        activeClassIndex: s.classes.length
      }
    })

  const removeClass = (index: number) =>
    updateState(s => {
      if (s.classes.length <= 1) return s
      if (index < 0 || index >= s.classes.length) return s

      const classes = s.classes.filter((_, i) => i !== index)

      let activeClassIndex = s.activeClassIndex ?? 0

      if (index === activeClassIndex) {
        activeClassIndex = Math.max(0, index - 1)
      } else if (index < activeClassIndex) {
        activeClassIndex -= 1
      }

      return {
        ...s,
        classes,
        activeClassIndex
      }
    })

  const allocatedLevels = useMemo(
    () => state.classes.reduce((sum, cls) => sum + (cls.level ?? 0), 0),
    [state.classes]
  )

  const remainingLevels = useMemo(
    () => Math.max(0, state.totalLevel - allocatedLevels),
    [state.totalLevel, allocatedLevels]
  )

  const setXp = (xp: number) =>
    updateState(s => ({ ...s, xp }))

  const setTotalLevels = (totalLevel: number) =>
    updateState(s => {
      // 1. Calculate the new base XP for this level and edition
      // Note: s.edition must be the EditionId string
      const newXp = getXpByLevelAndEdition(totalLevel, s.edition);

      // 2. Return the updated state with both values synced
      return { 
        ...s, 
        totalLevel, 
        xp: newXp 
      };
    })

  const setAlignment = (alignment: string) =>
    updateState(s => ({ ...s, alignment }))

  const setProficiencies = (proficiencies: Proficiency[]) =>
    updateState(s => ({ ...s, proficiencies }))

  const setWealth = (wealth: {
    gp?: number | null
    sp?: number | null
    cp?: number | null
  }) => {
    setState(prev => ({
      ...prev,
      wealth: {
        gp: wealth.gp ?? prev.wealth?.gp ?? null,
        sp: wealth.sp ?? prev.wealth?.sp ?? null,
        cp: wealth.cp ?? prev.wealth?.cp ?? null,
        baseGp: wealth.gp ?? prev.wealth?.baseGp ?? null
      }
    }))
  }

  const computeEquipmentTotals = (
    weaponIds: string[],
    armorIds: string[],
    gearIds: string[],
    edition: string
  ) => ({
    weight: calculateEquipmentWeight(weaponIds, armorIds, gearIds, weaponsData, armorData, gearData),
    equipmentCost: calculateEquipmentCost(weaponIds, armorIds, gearIds, weaponsData, armorData, gearData, edition),
  })

  const updateWeapons = (weaponIds: string[]) => {
    setState(prev => {
      if (!prev.edition) return prev
      const armorIds = prev.equipment?.armor ?? []
      const gearIds = prev.equipment?.gear ?? []
      const { weight, equipmentCost } = computeEquipmentTotals(weaponIds, armorIds, gearIds, prev.edition)
      const baseGp = prev.wealth?.baseGp ?? 0
      const remainingGp = Math.max(baseGp - equipmentCost, 0)

      return {
        ...prev,
        equipment: { ...prev.equipment, weapons: weaponIds, weight },
        wealth: { ...prev.wealth, gp: remainingGp }
      }
    })
  }

  const updateArmor = (armorIds: string[]) => {
    setState(prev => {
      if (!prev.edition) return prev
      const weaponIds = prev.equipment?.weapons ?? []
      const gearIds = prev.equipment?.gear ?? []
      const { weight, equipmentCost } = computeEquipmentTotals(weaponIds, armorIds, gearIds, prev.edition)
      const baseGp = prev.wealth?.baseGp ?? 0
      const remainingGp = Math.max(baseGp - equipmentCost, 0)

      return {
        ...prev,
        equipment: { ...prev.equipment, armor: armorIds, weight },
        wealth: { ...prev.wealth, gp: remainingGp }
      }
    })
  }

  const updateGear = (gearIds: string[]) => {
    setState(prev => {
      if (!prev.edition) return prev
      const weaponIds = prev.equipment?.weapons ?? []
      const armorIds = prev.equipment?.armor ?? []
      const { weight, equipmentCost } = computeEquipmentTotals(weaponIds, armorIds, gearIds, prev.edition)
      const baseGp = prev.wealth?.baseGp ?? 0
      const remainingGp = Math.max(baseGp - equipmentCost, 0)

      return {
        ...prev,
        equipment: { ...prev.equipment, gear: gearIds, weight },
        wealth: { ...prev.wealth, gp: remainingGp }
      }
    })
  }

  const setWeight = (weight: number) => {
    updateState(s => ({
      ...s,
      equipment: { ...s.equipment, weight }
    }))
  }

  const stepConfig = getStepConfig(state.type ?? 'pc')

  const getStepByIndex = (index: number) => {
    const step = stepConfig[Math.max(0, Math.min(index, stepConfig.length - 1))]
    return { id: step.id, name: step.label }
  }

  const getCurrentStepIndex = (stepId?: string) =>
    stepConfig.findIndex(step => step.id === stepId)

  const start = () =>
    updateState(s => ({ ...s, step: getStepByIndex(0) }))

  const nextStep = () => {
    setState(s => {
      const nextIndex = getCurrentStepIndex(s.step?.id) + 1
      const nextStep = getStepByIndex(nextIndex)
      return { ...s, step: nextStep }
    })
    setActiveClassIndex(null)
  }

  const prevStep = () => {
    setState(s => {
      const prevIndex = getCurrentStepIndex(s.step?.id) - 1
      const prevStep = getStepByIndex(prevIndex)
      return { ...s, step: prevStep }
    })
    setActiveClassIndex(null)
  }

  const goToStep = (stepId: string) => {
    const config = getStepConfig(state.type ?? 'pc')
    const index = config.findIndex(s => s.id === stepId)
    if (index < 0) return
    setState(s => ({ ...s, step: getStepByIndex(index) }))
    setActiveClassIndex(null)
  }

  const resetState = () => {
    setState(
      createInitialBuilderState(
        state.type ?? 'pc',
        state.edition,
        state.setting
      )
    )
  }

  const isComplete = (state: CharacterBuilderState) =>
    getStepConfig(state.type ?? 'pc').every(step => step.selector(state))

  return (
    <CharacterBuilderContext.Provider
      value={{
        state,

        allocatedLevels,
        remainingLevels,

        setCharacterType,
        openBuilder,
        setName,
        setEdition,
        setSetting,
        setRace,

        setClassId,
        setClassDefinitionId,
        setClassLevel,
        setActiveClassIndex,
        addClass,
        removeClass,
        updateClassLevel,
        updateClassDefinition,
        updateSubclass: updateClassDefinition,
        allocateRemainingLevels,

        setProficiencies,
        setWealth,

        updateWeapons,
        updateArmor,
        updateGear,
        setWeight,

        setAlignment,
        setTotalLevels,
        setXp,

        start,
        nextStep,
        prevStep,
        goToStep,
        resetState,
        isComplete,

        raceOptions,
        classOptions
      }}
    >
      {children}
    </CharacterBuilderContext.Provider>
  )
}
