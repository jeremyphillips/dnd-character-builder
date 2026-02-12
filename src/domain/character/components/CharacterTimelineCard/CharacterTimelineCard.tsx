import { TimelineCard } from '@/ui/cards'
import type { CardBadgeItem } from '@/ui/cards'

interface CharacterTimelineCardProps {
  characterId: string
  name: string
  imageUrl?: string
  timestamp?: string
  description?: string
  status?: 'pending' | 'approved'
  link?: string
  isEditable?: boolean
  onEdit?: () => void
  actions?: React.ReactNode
}

const CharacterTimelineCard = ({
  characterId,
  name,
  imageUrl,
  timestamp,
  description,
  status,
  link,
  isEditable,
  onEdit,
  actions,
}: CharacterTimelineCardProps) => {
  const badges: CardBadgeItem[] = status ? [{ type: 'status', value: status }] : []

  return (
    <TimelineCard
      avatar={{ src: imageUrl, name }}
      headline={name}
      timestamp={timestamp}
      description={description}
      badges={badges}
      link={link ?? `/characters/${characterId}`}
      isEditable={isEditable}
      onEdit={onEdit}
      actions={actions}
    />
  )
}

export default CharacterTimelineCard
