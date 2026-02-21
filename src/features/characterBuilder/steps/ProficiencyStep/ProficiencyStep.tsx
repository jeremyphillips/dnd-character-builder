import { useMemo, useCallback } from 'react'
import { useCharacterBuilder } from '@/features/characterBuilder/context'
import { classes } from '@/data'
import type { EditionId } from '@/data'
import type { ClassProficiency, ProficiencyOption } from '@/data/classes/types'
import type { Proficiency, ProficiencyTaxonomy } from '@/shared/types/character.core'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import LockIcon from '@mui/icons-material/Lock'

// ---------------------------------------------------------------------------
// Full 5e skill list (for classes with options: 'all')
// ---------------------------------------------------------------------------

const ALL_SKILLS_5E: ProficiencyOption[] = [
  { id: 'acrobatics', name: 'Acrobatics' },
  { id: 'animalHandling', name: 'Animal Handling' },
  { id: 'arcana', name: 'Arcana' },
  { id: 'athletics', name: 'Athletics' },
  { id: 'deception', name: 'Deception' },
  { id: 'history', name: 'History' },
  { id: 'insight', name: 'Insight' },
  { id: 'intimidation', name: 'Intimidation' },
  { id: 'investigation', name: 'Investigation' },
  { id: 'medicine', name: 'Medicine' },
  { id: 'nature', name: 'Nature' },
  { id: 'perception', name: 'Perception' },
  { id: 'performance', name: 'Performance' },
  { id: 'persuasion', name: 'Persuasion' },
  { id: 'religion', name: 'Religion' },
  { id: 'sleightOfHand', name: 'Sleight of Hand' },
  { id: 'stealth', name: 'Stealth' },
  { id: 'survival', name: 'Survival' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve class proficiency options — handles 'all' and string sentinel values */
function resolveOptions(prof: ClassProficiency): ProficiencyOption[] {
  if (prof.options === 'all') return ALL_SKILLS_5E
  if (typeof prof.options === 'string') {
    // Sentinel values like 'musical-instruments', 'all-artisan-tools'
    // TODO: resolve from a tool/instrument data file
    return []
  }
  return prof.options ?? []
}

/** Get proficiency groups for a given class and edition */
function getClassProficiencyGroups(
  classId: string | undefined,
  edition: string | undefined
): ClassProficiency[] {
  if (!classId || !edition) return []
  const cls = classes.find(c => c.id === classId)
  if (!cls) return []
  return cls.proficiencies.filter(p => p.edition === edition)
}

/** Build a unique proficiency key for a group (classId + taxonomy) */
function profKey(classId: string, taxonomy: string): string {
  return `${classId}::${taxonomy}`
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfGroup {
  classId: string
  className: string
  level: number
  prof: ClassProficiency
  options: ProficiencyOption[]
  fixed: ProficiencyOption[]
  choiceCount: number
  taxonomy: string
  displayName: string          // prof.name ?? taxonomy (e.g. "Non-Weapon Proficiency")
  canSpecialize: boolean       // 2e fighter weapon specialization
  key: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ProficiencyStep = () => {
  const { state, setProficiencies } = useCharacterBuilder()
  const { classes: selectedClasses, edition, proficiencies = [], editMode } = state

  // In edit mode, existing selections are locked — the user can only add new ones
  const lockedByGroup = useMemo(() => {
    const map = new Map<string, Set<string>>()
    if (!editMode?.lockedSelections) return map
    for (const [key, ids] of Object.entries(editMode.lockedSelections)) {
      map.set(key, new Set(ids))
    }
    return map
  }, [editMode?.lockedSelections])

  // Build proficiency groups across all selected classes
  const profGroups: ProfGroup[] = useMemo(() => {
    if (!edition) return []

    const result: ProfGroup[] = []
    for (const cls of selectedClasses) {
      if (!cls.classId) continue
      const groups = getClassProficiencyGroups(cls.classId, edition)
      for (const g of groups) {
        result.push({
          classId: cls.classId,
          className: classes.find(c => c.id === cls.classId)?.name ?? cls.classId,
          level: cls.level,
          prof: g,
          options: resolveOptions(g),
          fixed: g.fixed ?? [],
          choiceCount: g.choiceCount ?? 0,
          taxonomy: g.taxonomy,
          displayName: g.name ?? g.taxonomy,
          canSpecialize: g.canSpecialize ?? false,
          key: profKey(cls.classId, g.taxonomy),
        })
      }
    }
    return result
  }, [selectedClasses, edition])

  // Derive a map of current selections: key → Set<optionId>
  const selectionsByGroup = useMemo(() => {
    const map = new Map<string, Set<string>>()
    for (const p of (proficiencies as Proficiency[])) {
      if (!p?.id || !p?.option?.id) continue
      const key = profKey(p.id, p.taxonomy)
      if (!map.has(key)) map.set(key, new Set())
      map.get(key)!.add(p.option.id)
    }
    return map
  }, [proficiencies])

  const toggleOption = useCallback(
    (groupKey: string, classId: string, taxonomy: ProficiencyTaxonomy, choiceCount: number, option: ProficiencyOption) => {
      const current = selectionsByGroup.get(groupKey) ?? new Set<string>()
      const isSelected = current.has(option.id)
      const isLocked = lockedByGroup.get(groupKey)?.has(option.id) ?? false

      if (isSelected && isLocked) return

      let nextIds: Set<string>
      if (isSelected) {
        nextIds = new Set(current)
        nextIds.delete(option.id)
      } else {
        if (current.size >= choiceCount) return // at capacity
        nextIds = new Set(current)
        nextIds.add(option.id)
      }

      // Rebuild the full proficiencies array:
      // 1. Remove all entries for this group
      const otherProfs = (proficiencies as Proficiency[]).filter(
        (p: Proficiency) => profKey(p.id, p.taxonomy) !== groupKey
      )

      // 2. Add back selected options for this group
      const groupProfs: Proficiency[] = [...nextIds].map((optId: string) => {
        const matchingGroup = profGroups.find((g: ProfGroup) => g.key === groupKey)
        const opt = matchingGroup?.options.find((o: ProficiencyOption) => o.id === optId)

        return {
          id: classId,
          name: taxonomy,
          edition: edition as EditionId,
          taxonomy: taxonomy as ProficiencyTaxonomy,
          choiceCount,
          option: {
            id: optId,
            name: opt?.name ?? optId,
          },
        }
      })

      // 3. Also preserve fixed proficiencies for this group
      const fixedGroup = profGroups.find((g: ProfGroup) => g.key === groupKey)
      const fixedProfs: Proficiency[] = (
        fixedGroup?.fixed ?? []
      ).map((f: ProficiencyOption) => ({
        id: classId,
        name: taxonomy,
        edition: edition as EditionId,
        taxonomy: taxonomy as ProficiencyTaxonomy,
        option: {
          id: f.id,
          name: f.name,
        },
      }))

      setProficiencies([...otherProfs, ...fixedProfs, ...groupProfs])
    },
    [selectionsByGroup, lockedByGroup, proficiencies, profGroups, edition, setProficiencies]
  )

  if (profGroups.length === 0) {
    return (
      <>
        <h2>Proficiencies</h2>
        <Typography color="text.secondary">
          No proficiency choices available. Select a class first.
        </Typography>
      </>
    )
  }

  return (
    <>
      <h2>Choose Proficiencies</h2>

      <Stack spacing={2}>
        {profGroups.map((group: ProfGroup) => {
          const selected = selectionsByGroup.get(group.key) ?? new Set()
          const remaining = group.choiceCount - selected.size

          return (
            <Card key={group.key} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {group.className} — {group.displayName}
                  </Typography>
                  <Chip
                    label={
                      remaining > 0
                        ? `${remaining} remaining`
                        : 'Complete'
                    }
                    color={remaining > 0 ? 'warning' : 'success'}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Choose {group.choiceCount} from the options below.
                  {group.canSpecialize && (
                    <> You may spend extra slots to specialize in a weapon.</>
                  )}
                </Typography>

                {/* Fixed proficiencies */}
                {group.fixed.length > 0 && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      Granted automatically:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1, mt: 0.5 }}>
                      {group.fixed.map((f: ProficiencyOption) => (
                        <Chip
                          key={f.id}
                          label={f.name}
                          color="primary"
                          variant="filled"
                          size="small"
                        />
                      ))}
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                  </>
                )}

                {/* Selectable options */}
                {group.options.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {group.options.map((opt: ProficiencyOption) => {
                      const isChosen = selected.has(opt.id)
                      const isFixed = group.fixed.some((f: ProficiencyOption) => f.id === opt.id)
                      const isLocked = lockedByGroup.get(group.key)?.has(opt.id) ?? false
                      const isNonInteractive = isFixed || (isChosen && isLocked)
                      const costLabel = opt.cost ? ` (${opt.cost} slot${opt.cost > 1 ? 's' : ''})` : ''

                      return (
                        <Chip
                          key={opt.id}
                          label={`${opt.name}${costLabel}`}
                          icon={isLocked && isChosen ? <LockIcon sx={{ fontSize: 14 }} /> : undefined}
                          color={isChosen ? 'primary' : 'default'}
                          variant={isChosen ? 'filled' : 'outlined'}
                          disabled={isFixed}
                          onClick={
                            isNonInteractive
                              ? undefined
                              : () =>
                                  toggleOption(
                                    group.key,
                                    group.classId,
                                    group.taxonomy as ProficiencyTaxonomy,
                                    group.choiceCount,
                                    opt
                                  )
                          }
                          sx={{ cursor: isNonInteractive ? 'default' : 'pointer' }}
                        />
                      )
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Options not yet available for this category.
                  </Typography>
                )}
              </CardContent>
            </Card>
          )
        })}
      </Stack>
    </>
  )
}

export default ProficiencyStep
