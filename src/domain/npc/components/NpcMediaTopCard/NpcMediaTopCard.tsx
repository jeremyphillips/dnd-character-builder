import { MediaTopCard } from '@/ui/cards'
import { getById } from '@/domain/lookups'
import { classes } from '@/data'
import { standardAlignments } from '@/data'
import type { Character } from '@/shared/types'

type NpcWithId = Character & { id: string }

export interface NpcMediaTopCardProps {
  npc: NpcWithId
  link?: string
}

const formatNpcSubheadline = (npc: NpcWithId): string => {
  const parts: string[] = []

  if (npc.race) parts.push(npc.race)

  const primaryClass = npc.classes?.[0]
  if (primaryClass?.classId) {
    const cls = getById(classes as unknown as { id: string; name: string }[], primaryClass.classId)
    const className = cls?.name ?? primaryClass.classId
    const total = npc.totalLevel ?? primaryClass.level
    const suffix = npc.classes.length > 1 ? ` (${total})` : ''
    parts.push(`${className} ${primaryClass.level}${suffix}`)
  }

  if (npc.alignment) {
    const alignment = standardAlignments.find((a) => a.id === npc.alignment)
    parts.push(alignment?.name ?? (npc.alignment === 'tn' ? 'True Neutral' : npc.alignment))
  }

  return parts.filter(Boolean).join(' · ')
}

const NpcMediaTopCard = ({ npc, link }: NpcMediaTopCardProps) => (
  <MediaTopCard
    headline={npc.name}
    subheadline={formatNpcSubheadline(npc)}
    link={link}
  />
)

export default NpcMediaTopCard
