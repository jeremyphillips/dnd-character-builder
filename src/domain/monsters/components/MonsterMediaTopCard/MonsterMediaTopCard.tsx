import { MediaTopCard } from '@/ui/cards'
import type { CardBadgeItem } from '@/ui/cards'

interface MonsterMediaTopCardProps {
  name: string
  type: string
  subtype?: string
  sizeCategory?: string
  description?: string
  imageUrl?: string
  badges?: CardBadgeItem[]
  attribution?: string
  link?: string
  isEditable?: boolean
  onEdit?: () => void
  actions?: React.ReactNode
}

const MonsterMediaTopCard = ({
  name,
  type,
  subtype,
  sizeCategory,
  description,
  imageUrl,
  badges = [],
  attribution,
  link,
  isEditable,
  onEdit,
  actions,
}: MonsterMediaTopCardProps) => {
  const subheadline = [type, subtype, sizeCategory].filter(Boolean).join(' · ')

  return (
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
}

export default MonsterMediaTopCard
