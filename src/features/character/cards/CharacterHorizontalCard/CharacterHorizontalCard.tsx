import { HorizontalCompactCard } from '@/ui/patterns'
import type { CardBadgeProps } from '@/ui/primitives'

/** Card-ready class summary with resolved names (from GET /characters/me). */
export type CharacterCardClassSummary = {
  classId: string
  className: string
  subclassId?: string | null
  subclassName?: string | null
  level: number
}

interface CharacterHorizontalCardProps {
  characterId: string
  name: string
  race?: { id: string; name: string } | null | undefined
  classes?: CharacterCardClassSummary[]
  imageUrl?: string
  status?: 'pending' | 'approved'
  campaign?: { id: string; name: string }
  link?: string
  isEditable?: boolean
  onEdit?: () => void
  actions?: React.ReactNode
}

const CharacterHorizontalCard = ({
  characterId,
  name,
  race,
  classes,
  imageUrl,
  campaign,
  status,
  link,
  isEditable,
  onEdit,
  actions,
}: CharacterHorizontalCardProps) => {
  const classLine =
    Array.isArray(classes) && classes.length > 0
      ? classes
          .filter((c) => c && (c.className || c.classId))
          .map((c) => {
            const base = c.className || c.classId || ''
            const sub = c.subclassName ? `, ${c.subclassName}` : ''
            const levelStr = c.level ? ` Level ${c.level}` : ''
            return `${base}${sub}${levelStr}`
          })
          .join(' / ')
      : undefined

  const raceName = race?.name ?? undefined
  const subheadline = [raceName, classLine]
    .filter(Boolean)
    .join(' · ')

  const badges: CardBadgeProps[] = [
    ...(status ? [{ type: 'status', value: status }] : []),
    ...(campaign ? [{ type: 'tag', value: `Campaign: ${campaign.name}` }] : []),
  ] as CardBadgeProps[]

  return (
    <HorizontalCompactCard
      image={imageUrl}
      headline={name}
      subheadline={subheadline}
      badges={badges}
      link={link ?? `/characters/${characterId}`}
      isEditable={isEditable}
      onEdit={onEdit}
      actions={actions}
    />
  )
}

export default CharacterHorizontalCard
