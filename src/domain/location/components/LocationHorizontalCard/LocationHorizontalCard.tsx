import { HorizontalCompactCard } from '@/ui/cards'
import type { CardBadgeItem } from '@/ui/cards'

export interface LocationHorizontalCardProps {
  /** Link to the location detail route */
  link: string
  name: string
  type: string
  description?: string
  imageUrl?: string
  /** Whether this is a user-created location */
  isCustom?: boolean
  /** Parent location name, if nested */
  parentName?: string
  /** Color for the type badge */
  typeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
}

const LocationHorizontalCard = ({
  link,
  name,
  type,
  description,
  imageUrl,
  isCustom,
  parentName,
  typeColor = 'primary',
}: LocationHorizontalCardProps) => {
  const badges: CardBadgeItem[] = [
    { type: 'tag', value: type },
  ]
  if (isCustom) {
    badges.push({ type: 'status', value: 'Custom' })
  }

  const subheadline = parentName ? `Inside: ${parentName}` : undefined

  return (
    <HorizontalCompactCard
      image={imageUrl}
      headline={name}
      subheadline={subheadline}
      description={description}
      badges={badges}
      link={link}
    />
  )
}

export default LocationHorizontalCard
