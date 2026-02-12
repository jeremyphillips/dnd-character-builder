import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { equipment } from '@/data/equipment'
import { getEquipmentCostByEdition } from '@/domain/equipment/cost'
import EquipmentMediaTopCard from '@/domain/equipment/components/EquipmentMediaTopCard/EquipmentMediaTopCard'
import { ROUTES } from '../../routes'
import { apiFetch } from '../../api'

export default function EquipmentRoute() {
  const { id: campaignId } = useParams<{ id: string }>()
  const [edition, setEdition] = useState<string>('5e')
  const weaponsFirst12 = equipment.weapons.slice(0, 12)
  const armorFirst12 = equipment.armor.slice(0, 12)
  const gearFirst12 = equipment.gear.slice(0, 12)

  useEffect(() => {
    if (!campaignId) return
    apiFetch<{ campaign?: { edition: string } }>(`/api/campaigns/${campaignId}`)
      .then((data) => (data.campaign?.edition ? setEdition(data.campaign.edition) : undefined))
      .catch(() => {})
  }, [campaignId])

  const equipmentLink = (itemId: string) =>
    campaignId ? ROUTES.EQUIPMENT_DETAILS.replace(':id', campaignId).replace(':equipmentId', itemId) : undefined

  const gridSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
    gap: 2,
  } as const

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Equipment
      </Typography>

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Weapons
      </Typography>
      <Box sx={{ ...gridSx, mb: 4 }}>
        {weaponsFirst12.map((item) => (
          <EquipmentMediaTopCard
            key={item.id}
            name={item.name}
            subheadline={[item.damageType, getEquipmentCostByEdition(item, edition)].filter(Boolean).join(' · ')}
            link={equipmentLink(item.id)}
          />
        ))}
      </Box>

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Armor
      </Typography>
      <Box sx={{ ...gridSx, mb: 4 }}>
        {armorFirst12.map((item) => (
          <EquipmentMediaTopCard
            key={item.id}
            name={item.name}
            subheadline={[item.material, getEquipmentCostByEdition(item, edition)].filter(Boolean).join(' · ')}
            link={equipmentLink(item.id)}
          />
        ))}
      </Box>

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Gear
      </Typography>
      <Box sx={gridSx}>
        {gearFirst12.map((item) => (
          <EquipmentMediaTopCard
            key={item.id}
            name={item.name}
            subheadline={[item.category, getEquipmentCostByEdition(item, edition)].filter(Boolean).join(' · ')}
            link={equipmentLink(item.id)}
          />
        ))}
      </Box>
    </Box>
  )
}
