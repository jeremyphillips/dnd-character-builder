import { useEffect, useRef } from 'react'
import { useCharacterBuilder } from '@/features/characterBuilder/context'
import { InvalidationNotice } from '@/features/characterBuilder/components'
import { ButtonGroup } from '@/ui/elements'
import { classes, equipment, type EditionId } from '@/data'
import { getById } from '@/domain/lookups'
import { getClassRequirement } from '@/features/character/domain/validation'
import {
  calculateEquipmentCost,
  getEquipmentNotes,
  getItemCostGp,
  getAvailableMagicItems,
  getMagicItemBudget,
  getAllowedEquipment, 
  getClassEquipmentProficiency, 
  resolveEquipmentEdition
} from '@/features/equipment/domain'

import { calculateWealth } from '@/domain/wealth'

const EquipmentStep = () => {
  const initializedRef = useRef(false)

  const {
    state,
    setWealth,
    updateWeapons,
    updateArmor,
    updateGear,
    updateMagicItems,
    stepNotices,
    dismissNotice
  } = useCharacterBuilder()

  const { 
    step, 
    edition, 
    classes: selectedClasses,
    equipment: selectedEquipment,
    totalLevel,
    wealth
  } = state

  const isEditMode = !!state.editMode

  useEffect(() => {
    if (initializedRef.current) return
    if (!edition) return

    // Skip wealth initialization when editing an existing character
    if (isEditMode) {
      initializedRef.current = true
      return
    }

    // If baseGp is already set, wealth was initialized on a previous mount — don't reset
    if (wealth?.baseGp) {
      initializedRef.current = true
      return
    }

    // Look up the selected primary class's requirements (with edition fallback)
    const primaryClassId = selectedClasses[0]?.classId
    if (!primaryClassId) return

    const wealthReq = getClassRequirement(primaryClassId, edition as EditionId)
    if (!wealthReq?.startingWealth) return

    const resolved = calculateWealth(
      totalLevel ?? 0,
      edition as EditionId,
      wealthReq.startingWealth
    )

    if (!resolved) return

    setWealth({
      gp: resolved.gp,
      sp: 0,
      cp: 0
    })

    initializedRef.current = true
  }, [edition, totalLevel, selectedClasses, setWealth, wealth?.baseGp, isEditMode])

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

  if (!edition) return null

  const equipEdition = resolveEquipmentEdition(edition)

  // Derive allowed equipment from the class proficiency data.
  const weaponProf = getClassEquipmentProficiency(selectedClassId, edition, 'weapons')
  const armorProf  = getClassEquipmentProficiency(selectedClassId, edition, 'armor')
  // Gear is edition-catalogue–wide; proficiency data doesn't restrict it.
  const gearProf   = { categories: ['all'], items: [] as string[] }

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

  const allowedWeapons = getAllowedEquipment({ items: equipment.weapons, edition, proficiency: weaponProf })
  const allowedArmor   = getAllowedEquipment({ items: equipment.armor,   edition, proficiency: armorProf })
  const allowedGear    = getAllowedEquipment({ items: equipment.gear,    edition, proficiency: gearProf })

  const buildOptions = (allowed: any[], selected: string[]) =>
    allowed.map(item => {
      const cost = getItemCostGp(item, edition)
      const isSelected = selected.includes(item.id)
      const costWithoutThis = isSelected ? currentCost - cost : currentCost
      const wouldExceedGold = costWithoutThis + cost > baseGp

      return {
        id: item.id,
        label: `${item.name} (${item.editionData.find((d: { edition: string; cost?: string }) => d.edition === equipEdition)?.cost ?? '—'})`,
        disabled: !isSelected && wouldExceedGold,
      }
    })

  const weaponOptions = buildOptions(allowedWeapons, selectedWeapons)
  const armorOptions  = buildOptions(allowedArmor, selectedArmor)
  const gearOptions   = buildOptions(allowedGear, selectedGear)

  const cls = selectedClassId ? getById(classes, selectedClassId) : undefined
  const requirements = cls?.requirements

  const armorNotes = requirements
    ? getEquipmentNotes({ requirements, edition, slot: 'armor' })
    : []

  const weaponNotes = requirements
    ? getEquipmentNotes({ requirements, edition, slot: 'weapons' })
    : []

  const gearNotes = requirements
    ? getEquipmentNotes({ requirements, edition, slot: 'tools' })
    : []

  // ── Magic items ──
  const characterLevel = totalLevel ?? 0
  const magicItemBudget = getMagicItemBudget(edition as EditionId, characterLevel)
  const availableMagicItems = getAvailableMagicItems(edition as EditionId, characterLevel)
  const selectedMagicItems = selectedEquipment?.magicItems ?? []

  const selectedPermanentCount = selectedMagicItems.filter(id => {
    const item = availableMagicItems.find(m => m.id === id)
    return item && !item.consumable
  }).length

  const selectedConsumableCount = selectedMagicItems.filter(id => {
    const item = availableMagicItems.find(m => m.id === id)
    return item?.consumable
  }).length

  const magicItemOptions = availableMagicItems.map(item => {
    const datum = item.editionData.find(
      (d: { edition: string }) => d.edition === resolveEquipmentEdition(edition)
    )
    const isSelected = selectedMagicItems.includes(item.id)

    // Budget enforcement: disable unselected items if budget is full
    let disabled = false
    if (!isSelected && magicItemBudget) {
      if (item.consumable) {
        disabled = selectedConsumableCount >= magicItemBudget.consumableSlots
      } else {
        disabled = selectedPermanentCount >= magicItemBudget.permanentSlots
      }
    }

    const rarityLabel = datum?.rarity ? ` [${datum.rarity}]` : ''
    const costLabel = datum?.cost && datum.cost !== '—' ? ` (${datum.cost})` : ''

    return {
      id: item.id,
      label: `${item.name}${rarityLabel}${costLabel}`,
      disabled
    }
  })

  const equipmentNotices = stepNotices.get('equipment') ?? []

  return (
    <>
      <h2>Choose {step.name}</h2>
      <InvalidationNotice items={equipmentNotices} onDismiss={() => dismissNotice('equipment')} />
      {wealth &&
      <>
        <p>Gold remaining: {Math.round((wealth.gp ?? 0) * 100) / 100} gp / {wealth.baseGp} gp</p>
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

      {/* Magic items — only shown for editions with a magic item budget */}
      {magicItemBudget && availableMagicItems.length > 0 && (
        <>
          <h4>Magic Items</h4>
          <small>
            Permanent: {selectedPermanentCount} / {magicItemBudget.permanentSlots}
            {' · '}
            Consumable: {selectedConsumableCount} / {magicItemBudget.consumableSlots}
            {magicItemBudget.maxAttunement != null && (
              <> · Attunement slots: {magicItemBudget.maxAttunement}</>
            )}
          </small>
          <ButtonGroup
            options={magicItemOptions}
            value={selectedMagicItems}
            onChange={updateMagicItems}
            multiSelect
            autoSelectSingle={false}
            size="sm"
          />
        </>
      )}
    </>
  )
}


export default EquipmentStep
