import { useCharacterBuilder } from '@/characterBuilder'
import { ButtonGroup } from '@/components/elements'
import { classes, equipment } from '@/data'
import { getAllowedEquipment, getById, getClassRequirement, getEquipmentNotes } from '@/helpers'

const EquipmentStep = () => {
  const { state, setWeapons, setArmor } = useCharacterBuilder()
  const { step, edition, characterClass, equipment: selected } = state

  const classReq = getClassRequirement(characterClass, edition)
  if (!classReq) return null
  
  console.log(characterClass, 'classReq', classReq)
  //console.log('equipment.weapons ',equipment.weapons)
  
  const allowedWeapons = getAllowedEquipment({
    items: equipment.weapons,
    edition,
    requirement: classReq.equipment.weapons
  })

  const allowedArmor = getAllowedEquipment({
    items: equipment.armor,
    edition,
    requirement: classReq.equipment.armor
  })

  const cls = getById(classes, characterClass)

  const armorNotes = cls
    ? getEquipmentNotes({
        requirements: cls.requirements,
        edition,
        slot: 'armor'
      })
    : []

  const weaponNotes = cls
    ? getEquipmentNotes({
        requirements: cls.requirements,
        edition,
        slot: 'weapons'
      })
    : []

  return (
    <>
      <h2>Choose {step.name}</h2>
      <h4>Weapons</h4>
      <ButtonGroup
        options={allowedWeapons.map(w => ({
          id: w.id,
          label: w.name
        }))}
        value={selected?.weapons ?? []}
        onChange={setWeapons}
        multiSelect
        autoSelectSingle
      />

      {weaponNotes.length > 0 && (
        <ul className="equipment-notes">
          {weaponNotes.map(note => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      )}

      <h4>Armor</h4>
      <ButtonGroup
        options={allowedArmor.map(a => ({
          id: a.id,
          label: a.name
        }))}
        value={selected?.armor ?? []}
        onChange={setArmor}
        multiSelect
        autoSelectSingle
      />

      {armorNotes.length > 0 && (
        <ul className="equipment-notes">
          {armorNotes.map(note => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      )}
    </>
  )
}


export default EquipmentStep
