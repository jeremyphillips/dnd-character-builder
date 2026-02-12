import { TimelineCard } from '@/ui/cards'
import type { CardBadgeItem } from '@/ui/cards'
import { formatSessionDateTime } from '@/domain/session/dates'

interface SessionTimelineCardProps {
  sessionId: string
  title: string
  date: string
  description?: string
  avatar?: { src?: string; name?: string } | { src?: string; name?: string }[]
  badges?: CardBadgeItem[]
  link?: string
  isEditable?: boolean
  onEdit?: () => void
  actions?: React.ReactNode
}

const SessionTimelineCard = ({
  sessionId,
  title,
  date,
  description,
  avatar,
  badges = [],
  link,
  isEditable,
  onEdit,
  actions,
}: SessionTimelineCardProps) => (
  <TimelineCard
    avatar={avatar}
    headline={title}
    timestamp={formatSessionDateTime(date)}
    description={description}
    badges={badges}
    link={link ?? `/sessions/${sessionId}`}
    isEditable={isEditable}
    onEdit={onEdit}
    actions={actions}
  />
)

export default SessionTimelineCard
