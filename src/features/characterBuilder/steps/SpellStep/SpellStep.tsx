import { useMemo, useCallback } from 'react'
import { useCharacterBuilder } from '@/characterBuilder/context'
import { classes } from '@/data'
import { getClassProgression } from '@/domain/character'
import { getAvailableSpells, groupSpellsByLevel, getSpellLimits } from '@/domain/spells'
import type { SpellWithEntry } from '@/domain/spells'
import { SpellHorizontalCard } from '@/domain/spells/components'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function levelHeading(level: number): string {
  if (level === 0) return 'Cantrips'
  return `${level}${level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th'} Level`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SpellStep = () => {
  const { state, setSpells } = useCharacterBuilder()
  const { classes: selectedClasses, edition, spells: selectedSpells = [], step } = state

  // Merge available spells from all selected classes
  const { availableByLevel, limits } = useMemo(() => {
    if (!edition) return { availableByLevel: new Map<number, SpellWithEntry[]>(), limits: [] as ReturnType<typeof getSpellLimits>[] }

    const allAvailable: SpellWithEntry[] = []
    const seenIds = new Set<string>()
    const classLimits: ReturnType<typeof getSpellLimits>[] = []

    for (const cls of selectedClasses) {
      if (!cls.classId) continue
      const prog = getClassProgression(cls.classId, edition)
      if (!prog?.spellProgression) continue

      classLimits.push(getSpellLimits(prog, cls.level))

      for (const s of getAvailableSpells(cls.classId, edition)) {
        if (!seenIds.has(s.spell.id)) {
          seenIds.add(s.spell.id)
          allAvailable.push(s)
        }
      }
    }

    return { availableByLevel: groupSpellsByLevel(allAvailable), limits: classLimits }
  }, [selectedClasses, edition])

  // Aggregate limits across all classes
  const aggregatedLimits = useMemo(() => {
    let cantrips = 0
    let totalKnown = 0
    let maxSpellLevel = 0

    for (const l of limits) {
      cantrips += l.cantrips
      totalKnown += l.totalKnown
      maxSpellLevel = Math.max(maxSpellLevel, l.maxSpellLevel)
    }

    // For prepared casters (totalKnown = 0), allow selecting any number up to catalog size
    const isPreparedOnly = limits.length > 0 && limits.every(l => l.totalKnown === 0)

    return { cantrips, totalKnown, maxSpellLevel, isPreparedOnly }
  }, [limits])

  // Split selected spells into cantrips and leveled
  const selectedCantrips = useMemo(() => {
    const cantripIds = new Set<string>()
    for (const [level, spells] of availableByLevel) {
      if (level === 0) {
        for (const s of spells) cantripIds.add(s.spell.id)
      }
    }
    return selectedSpells.filter((id: string) => cantripIds.has(id))
  }, [selectedSpells, availableByLevel])

  const selectedLeveled = useMemo(() => {
    const cantripIds = new Set<string>()
    for (const [level, spells] of availableByLevel) {
      if (level === 0) {
        for (const s of spells) cantripIds.add(s.spell.id)
      }
    }
    return selectedSpells.filter((id: string) => !cantripIds.has(id))
  }, [selectedSpells, availableByLevel])

  const toggleSpell = useCallback(
    (spellId: string, isCantrip: boolean) => {
      const current = selectedSpells ?? []
      if (current.includes(spellId)) {
        // Deselect
        setSpells(current.filter((id: string) => id !== spellId))
      } else {
        // Check limits
        if (isCantrip) {
          if (aggregatedLimits.cantrips > 0 && selectedCantrips.length >= aggregatedLimits.cantrips) return
        } else {
          if (aggregatedLimits.totalKnown > 0 && selectedLeveled.length >= aggregatedLimits.totalKnown) return
        }
        setSpells([...current, spellId])
      }
    },
    [selectedSpells, setSpells, aggregatedLimits, selectedCantrips.length, selectedLeveled.length]
  )

  if (availableByLevel.size === 0) {
    return (
      <div>
        <h2>{step.name}</h2>
        <Typography variant="body2" color="text.secondary">
          No spells available for the selected class and edition.
        </Typography>
      </div>
    )
  }

  const classNames = selectedClasses
    .filter((c: { classId?: string }) => c.classId)
    .map((c: { classId?: string }) => {
      const cls = classes.find(cl => cl.id === c.classId)
      return (edition && cls?.displayNameByEdition?.[edition]) ?? cls?.name ?? c.classId
    })
    .join(' / ')

  return (
    <div>
      <h2>Choose {step.name}</h2>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Select spells for <strong>{classNames}</strong>.
      </Typography>

      {/* Limits summary */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        {aggregatedLimits.cantrips > 0 && (
          <Chip
            label={`Cantrips: ${selectedCantrips.length} / ${aggregatedLimits.cantrips}`}
            size="small"
            color={selectedCantrips.length >= aggregatedLimits.cantrips ? 'success' : 'default'}
            variant="outlined"
          />
        )}
        {aggregatedLimits.totalKnown > 0 && (
          <Chip
            label={`Spells Known: ${selectedLeveled.length} / ${aggregatedLimits.totalKnown}`}
            size="small"
            color={selectedLeveled.length >= aggregatedLimits.totalKnown ? 'success' : 'default'}
            variant="outlined"
          />
        )}
        {aggregatedLimits.isPreparedOnly && (
          <Chip
            label={`Prepared caster — ${selectedLeveled.length} spell${selectedLeveled.length !== 1 ? 's' : ''} selected`}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>

      {/* Spell list by level */}
      {[...availableByLevel.entries()].map(([level, spells]) => {
        const isCantrip = level === 0

        return (
          <Box key={level} sx={{ mb: 3 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              {levelHeading(level)}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({spells.length} available)
              </Typography>
            </Typography>

            <Stack spacing={1}>
              {spells
                .sort((a, b) => a.spell.name.localeCompare(b.spell.name))
                .map(({ spell, entry }) => (
                  <SpellHorizontalCard
                    key={spell.id}
                    spell={spell}
                    editionEntry={entry}
                    selected={selectedSpells.includes(spell.id)}
                    onToggle={() => toggleSpell(spell.id, isCantrip)}
                  />
                ))}
            </Stack>
          </Box>
        )
      })}
    </div>
  )
}

export default SpellStep
