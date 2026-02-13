import HorizontalCompactCard from '@/ui/cards/HorizontalCompactCard'
import type { CardBadgeItem } from '@/ui/cards/HorizontalCompactCard'
import type { Spell, SpellEditionEntry } from '@/data/classes/spells'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SpellHorizontalCardProps {
  spell: Spell
  /** Edition entry to display (determines level, classes, ritual, etc.) */
  editionEntry?: SpellEditionEntry
  /** Whether the spell is currently selected */
  selected?: boolean
  /** Called when the card is clicked */
  onToggle?: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function schoolLabel(school: string): string {
  return school.charAt(0).toUpperCase() + school.slice(1)
}

function levelLabel(level: number): string {
  if (level === 0) return 'Cantrip'
  return `Level ${level}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SpellHorizontalCard = ({
  spell,
  editionEntry,
  selected = false,
  onToggle,
}: SpellHorizontalCardProps) => {
  const entry = editionEntry ?? spell.editions[0]
  if (!entry) return null

  const badges: CardBadgeItem[] = [
    { type: 'tag', value: levelLabel(entry.level) },
    { type: 'tag', value: schoolLabel(spell.school) },
  ]

  if (entry.ritual) badges.push({ type: 'tag', value: 'Ritual' })
  if (entry.concentration) badges.push({ type: 'tag', value: 'Concentration' })

  const classNames = entry.classes
    .map(c => c.charAt(0).toUpperCase() + c.slice(1))
    .join(', ')

  return (
    <div
      onClick={onToggle}
      style={{ cursor: onToggle ? 'pointer' : undefined }}
    >
      <HorizontalCompactCard
        headline={spell.name}
        subheadline={classNames}
        badges={badges}
        description={entry.source ? `Source: ${entry.source}` : undefined}
        actions={
          onToggle ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: selected ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-divider)',
                backgroundColor: selected ? 'var(--mui-palette-primary-main)' : 'transparent',
                color: selected ? '#fff' : 'transparent',
                fontSize: 14,
                fontWeight: 700,
                transition: 'all 0.15s ease',
              }}
            >
              {selected ? '✓' : ''}
            </span>
          ) : undefined
        }
      />
    </div>
  )
}

export default SpellHorizontalCard
