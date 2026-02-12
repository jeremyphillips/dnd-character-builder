import { MediaTopCard } from '@/ui/cards'
import type { CardBadgeItem } from '@/ui/cards'

interface CharacterMediaTopCardProps {
  characterId: string
  name: string
  race?: string
  class: string
  level?: number
  description?: string
  imageUrl?: string
  status?: 'pending' | 'approved'
  attribution?: string
  link?: string
  isEditable?: boolean
  onEdit?: () => void
  actions?: React.ReactNode
}

const CharacterMediaTopCard = ({
  characterId,
  name,
  race,
  class: className,
  level,
  description,
  imageUrl,
  status,
  attribution,
  link,
  isEditable,
  onEdit,
  actions,
}: CharacterMediaTopCardProps) => {
  const subheadline = [race, className, level != null ? `Level ${level}` : undefined]
    .filter(Boolean)
    .join(' · ')
  const badges: CardBadgeItem[] = status ? [{ type: 'status', value: status }] : []

  return (
    <MediaTopCard
      image={imageUrl}
      headline={name}
      subheadline={subheadline}
      description={description}
      badges={badges}
      attribution={attribution}
      link={link ?? `/characters/${characterId}`}
      isEditable={isEditable}
      onEdit={onEdit}
      actions={actions}
    />
  )
}

export default CharacterMediaTopCard
