import { MediaTopCard } from '@/ui/cards'
import type { CardBadgeItem } from '@/ui/cards'

interface EquipmentMediaTopCardProps {
  equipmentId?: string
  name: string
  subheadline?: string
  description?: string
  imageUrl?: string
  badges?: CardBadgeItem[]
  attribution?: string
  link?: string // e.g. /campaigns/:id/equipment/:equipmentId
  isEditable?: boolean
  onEdit?: () => void
  actions?: React.ReactNode
}

const EquipmentMediaTopCard = ({
  name,
  subheadline,
  description,
  imageUrl,
  badges = [],
  attribution,
  link,
  isEditable,
  onEdit,
  actions,
}: EquipmentMediaTopCardProps) => (
  <MediaTopCard
    image={imageUrl}
    headline={name}
    subheadline={subheadline}
    description={description}
    badges={badges}
    attribution={attribution}
    link={link}
    isEditable={isEditable}
    onEdit={onEdit}
    actions={actions}
  />
)

export default EquipmentMediaTopCard
