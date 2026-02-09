import { useEffect, useRef } from 'react'
import { useCharacterBuilder } from '@/characterBuilder'
import { ButtonGroup } from '@/components/elements'
import { classes, equipment, type ClassRequirement, type EditionId } from '@/data'
import {
  calculateEquipmentCost,
  calculateWealth5e,
  type CalculateWealth5eStartingWealth,
  getAllowedEquipment,
  getById,
  getClassRequirement,
  getEquipmentNotes,
  getItemCostGp
} from '@/helpers'

const EquipmentStep = () => {
  const initializedRef = useRef(false)

  const {
    state,
    setWealth,
    updateWeapons,
    updateArmor,
    updateGear
  } = useCharacterBuilder()

  const { 
    step, 
    edition, 
    classes: selectedClasses,
    equipment: selectedEquipment,
    totalLevel,
    wealth
  } = state

  useEffect(() => {
    if (initializedRef.current) return
    if (edition !== '5e') return

    const primaryClass = classes[0]
    if (!primaryClass?.requirements) return

    const wealthReq = primaryClass.requirements.find(
      r => r.edition === '5e' && r.startingWealth
    )

    if (!wealthReq?.startingWealth) return

    const resolved = calculateWealth5e(
      totalLevel,
      wealthReq.startingWealth as CalculateWealth5eStartingWealth
    )

    if (!resolved) return

    setWealth({
      gp: resolved.gp,
      sp: 0,
      cp: 0
    })

    initializedRef.current = true
  }, [edition, totalLevel, classes, setWealth])

  const { 
    weapons: selectedWeapons = [], 
    armor: selectedArmor = [], 
    gear: selectedGear = [],
    weight: currentWeight 
  } = selectedEquipment || {}

  const activeIndex = state.activeClassIndex ?? 0
  const activeClass = selectedClasses[activeIndex]
  
  if (!activeClass) return null
  
  const {
    classId: selectedClassId,
    // classDefinitionId: selectedClassDefinitionId,
    // level: selectedLevel
  } = activeClass ?? {}

  const classReq = getClassRequirement(selectedClassId, edition as EditionId)

  if (!classReq || !edition) return null

  const baseGp = wealth?.baseGp ?? 0

  const currentCost = calculateEquipmentCost(
    selectedWeapons,
    selectedArmor,
    selectedGear,
    equipment.weapons,
    equipment.armor,
    equipment.gear,
    edition
  )

  const allowedWeapons = getAllowedEquipment({
    items: equipment.weapons,
    edition,
    requirement: classReq.equipment.weapons
  })

  const weaponOptions = allowedWeapons.map(w => {
    const cost = getItemCostGp(w, edition)
    const isSelected = selectedWeapons.includes(w.id)

    const costWithoutThis = isSelected
      ? currentCost - cost
      : currentCost

    const wouldExceedGold = costWithoutThis + cost > baseGp

    return {
      id: w.id,
      label: `${w.name} (${w.editionData.find(d => d.edition === edition)?.cost ?? '—'})`,
      disabled: !isSelected && wouldExceedGold
    }
  })

  const allowedArmor = getAllowedEquipment({
    items: equipment.armor,
    edition,
    requirement: classReq.equipment.armor
  })

  const armorOptions = allowedArmor.map(a => {
    const cost = getItemCostGp(a, edition)
    const isSelected = selectedArmor.includes(a.id)

    const costWithoutThis = isSelected
      ? currentCost - cost
      : currentCost

    const wouldExceedGold = costWithoutThis + cost > baseGp

    return {
      id: a.id,
      label: `${a.name} (${a.editionData.find(d => d.edition === edition)?.cost ?? '—'})`,
      disabled: !isSelected && wouldExceedGold
    }
  })

  const gearRequirement = classReq.equipment.tools ?? {
    categories: 'all' as const,
    individuals: 'none' as const
  }
  const allowedGear = getAllowedEquipment({
    items: equipment.gear,
    edition,
    requirement: gearRequirement
  })

  const gearOptions = allowedGear.map(g => {
    const cost = getItemCostGp(g, edition)
    const isSelected = selectedGear.includes(g.id)

    const costWithoutThis = isSelected
      ? currentCost - cost
      : currentCost

    const wouldExceedGold = costWithoutThis + cost > baseGp

    return {
      id: g.id,
      label: `${g.name} (${g.editionData.find(d => d.edition === edition)?.cost ?? '—'})`,
      disabled: !isSelected && wouldExceedGold
    }
  })

  const cls = selectedClassId ? getById(classes, selectedClassId) : undefined
  const requirements =
    cls && 'requirements' in cls && cls.requirements
      ? (cls.requirements as ClassRequirement[])
      : undefined

  const armorNotes = requirements
    ? getEquipmentNotes({ requirements, edition, slot: 'armor' })
    : []

  const weaponNotes = requirements
    ? getEquipmentNotes({ requirements, edition, slot: 'weapons' })
    : []

  const gearNotes = requirements
    ? getEquipmentNotes({ requirements, edition, slot: 'tools' })
    : []

  return (
    <>
      <h2>Choose {step.name}</h2>
      {wealth &&
      <>
        <p>Gold remaining: {Math.round(wealth.gp * 100) / 100} gp / {wealth.baseGp} gp</p>
        {/* <p>Wealth: {wealth.gp} gp, {wealth.sp} sp, {wealth.cp} cp</p> */}
      </>
      }
      <small>Current weight: {currentWeight} lbs.</small>

      <h4>Weapons</h4>
      <ButtonGroup
        options={weaponOptions}
        value={selectedWeapons}
        onChange={updateWeapons}
        multiSelect
        autoSelectSingle
        size='sm'
      />

      {weaponNotes.length > 0 && (
        <ul className="equipment-notes">
          {weaponNotes.map((note:{ id: string, text: string}) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      )}

      <h4>Armor</h4>
      <ButtonGroup
        options={armorOptions}
        value={selectedArmor ?? []}
        onChange={updateArmor}
        multiSelect
        autoSelectSingle
        size='sm'
      />

      {armorNotes.length > 0 && (
        <ul className="equipment-notes">
          {armorNotes.map((note: { id: string, text: string }) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      )}

      <h4>Gear</h4>
      <ButtonGroup
        options={gearOptions}
        value={selectedGear}
        onChange={updateGear}
        multiSelect
        autoSelectSingle={false}
        size="sm"
      />

      {gearNotes.length > 0 && (
        <ul className="equipment-notes">
          {gearNotes.map((note: { id: string, text: string }) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      )}
    </>
  )
}


export default EquipmentStep
