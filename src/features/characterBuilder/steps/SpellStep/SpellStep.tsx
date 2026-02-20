import { useMemo, useCallback } from 'react'
import { useCharacterBuilder } from '@/features/characterBuilder/context'
import { classes } from '@/data'
import { getClassProgression } from '@/features/character/domain/progression'
import { getAvailableSpells, groupSpellsByLevel, getSpellLimits } from '@/domain/spells'
import type { SpellWithEntry } from '@/domain/spells'
import { SpellHorizontalCard } from '@/domain/spells/components'
import { InvalidationNotice } from '@/features/characterBuilder/components'

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
  const { state, setSpells, stepNotices, dismissNotice } = useCharacterBuilder()
  const { classes: selectedClasses, edition, spells: selectedSpells = [], step } = state

  const notices = stepNotices.get('spells') ?? []

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

  // Build per-level limits: level → max selectable spells
  // Cantrips (level 0) use cantripsKnown; leveled spells use slot counts.
  // For "known" casters totalKnown also serves as an overall cap.
  const { perLevelMax, maxSpellLevel, totalKnown } = useMemo(() => {
    const map = new Map<number, number>()
    let maxLvl = 0
    let known = 0

    for (const l of limits) {
      // Cantrips
      if (l.cantrips > 0) {
        map.set(0, (map.get(0) ?? 0) + l.cantrips)
      }
      // Leveled spell slots
      for (let i = 0; i < l.slotsByLevel.length; i++) {
        const spellLevel = i + 1
        if (l.slotsByLevel[i] > 0) {
          map.set(spellLevel, (map.get(spellLevel) ?? 0) + l.slotsByLevel[i])
        }
      }
      maxLvl = Math.max(maxLvl, l.maxSpellLevel)
      known += l.totalKnown
    }

    return { perLevelMax: map, maxSpellLevel: maxLvl, totalKnown: known }
  }, [limits])

  // Count selected spells per level
  const selectedPerLevel = useMemo(() => {
    const map = new Map<number, number>()
    const selected = new Set(selectedSpells)

    for (const [level, spells] of availableByLevel) {
      let count = 0
      for (const s of spells) {
        if (selected.has(s.spell.id)) count++
      }
      if (count > 0) map.set(level, count)
    }

    return map
  }, [selectedSpells, availableByLevel])

  const totalSelected = useMemo(() => {
    let sum = 0
    for (const [level, count] of selectedPerLevel) {
      if (level !== 0) sum += count // cantrips tracked separately
    }
    return sum
  }, [selectedPerLevel])

  /** Check whether a given spell level is full (no more selections allowed). */
  const isLevelFull = useCallback(
    (spellLevel: number) => {
      const max = perLevelMax.get(spellLevel) ?? 0
      const count = selectedPerLevel.get(spellLevel) ?? 0
      if (max > 0 && count >= max) return true
      // For "known" casters, also enforce overall totalKnown cap on leveled spells
      if (spellLevel > 0 && totalKnown > 0 && totalSelected >= totalKnown) return true
      return false
    },
    [perLevelMax, selectedPerLevel, totalKnown, totalSelected]
  )

  const toggleSpell = useCallback(
    (spellId: string, spellLevel: number) => {
      const current = selectedSpells ?? []
      if (current.includes(spellId)) {
        // Deselect
        setSpells(current.filter((id: string) => id !== spellId))
      } else {
        // Enforce per-level limit
        if (isLevelFull(spellLevel)) return
        setSpells([...current, spellId])
      }
    },
    [selectedSpells, setSpells, isLevelFull]
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

      {/* Centralized invalidation notice */}
      <InvalidationNotice items={notices} onDismiss={() => dismissNotice('spells')} />

      {/* Per-level limits summary */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        {[...perLevelMax.entries()]
          .sort(([a], [b]) => a - b)
          .filter(([level]) =>
            level === 0
              ? (perLevelMax.get(0) ?? 0) > 0
              : level <= maxSpellLevel
          )
          .map(([level, max]) => {
            const count = selectedPerLevel.get(level) ?? 0
            const full = count >= max
            return (
              <Chip
                key={level}
                label={`${levelHeading(level)}: ${count} / ${max}`}
                size="small"
                color={full ? 'success' : 'default'}
                variant="outlined"
              />
            )
          })}
        {totalKnown > 0 && (
          <Chip
            label={`Total Known: ${totalSelected} / ${totalKnown}`}
            size="small"
            color={totalSelected >= totalKnown ? 'success' : 'default'}
            variant="outlined"
          />
        )}
      </Stack>

      {/* Spell list by level — only show levels the character can cast */}
      {[...availableByLevel.entries()]
        .filter(([level]) => level === 0
          ? (perLevelMax.get(0) ?? 0) > 0  // show cantrips if the class grants any
          : level <= maxSpellLevel
        )
        .map(([level, spells]) => {
        const levelFull = isLevelFull(level)

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
                .map(({ spell, entry }) => {
                  const isSelected = selectedSpells.includes(spell.id)
                  return (
                    <SpellHorizontalCard
                      key={spell.id}
                      spell={spell}
                      editionEntry={entry}
                      selected={isSelected}
                      disabled={levelFull && !isSelected}
                      onToggle={() => toggleSpell(spell.id, level)}
                    />
                  )
                })}
            </Stack>
          </Box>
        )
      })}
    </div>
  )
}

export default SpellStep
