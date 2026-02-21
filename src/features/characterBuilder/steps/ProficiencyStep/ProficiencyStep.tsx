import { useMemo, useCallback } from 'react'
import { useCharacterBuilder } from '@/features/characterBuilder/context'
import { classes, editions } from '@/data'
import type { ClassProficiencyEntry, ClassProficienciesByEdition } from '@/data/classes/types'
import type { EditionProficiency } from '@/data/types'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import LockIcon from '@mui/icons-material/Lock'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All skills defined for an edition, keyed by ID. */
function getEditionSkills(editionId: string): Record<string, EditionProficiency> {
  const ed = editions.find(e => e.id === editionId)
  if (!ed?.proficiencies) return {}
  const edProfs = ed.proficiencies as Partial<Record<string, { skills: Record<string, EditionProficiency> }>>
  return edProfs[editionId]?.skills ?? {}
}

/** Resolve a skill ID to a display name via the edition catalogue. */
function getSkillName(skillId: string, editionSkills: Record<string, EditionProficiency>): string {
  return editionSkills[skillId]?.name ?? skillId
}

/** Extract skill proficiency entries for a class + edition from the new data. */
function getClassSkillEntries(
  classId: string | undefined,
  edition: string | undefined,
): ClassProficiencyEntry[] {
  if (!classId || !edition) return []
  const cls = classes.find(c => c.id === classId)
  if (!cls) return []
  const profs = cls.proficiencies
  if (Array.isArray(profs)) return []
  const edProfs = (profs as ClassProficienciesByEdition)[edition]
  if (!edProfs?.skills) return []
  return Array.isArray(edProfs.skills) ? edProfs.skills : [edProfs.skills]
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SkillGroup {
  classId: string
  className: string
  entry: ClassProficiencyEntry
  /** Skill IDs available for selection. */
  options: string[]
  choiceCount: number
  key: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ProficiencyStep = () => {
  const { state, setProficiencies } = useCharacterBuilder()
  const { classes: selectedClasses, edition, proficiencies, editMode } = state
  const selectedSkills = proficiencies?.skills ?? []

  const editionSkills = useMemo(() => getEditionSkills(edition ?? ''), [edition])

  const lockedSkillIds = useMemo(() => {
    const ids = editMode?.lockedSelections?.['skills']
    return ids ? new Set(ids) : new Set<string>()
  }, [editMode?.lockedSelections])

  // Build one SkillGroup per class per 'choice' skill entry
  const skillGroups: SkillGroup[] = useMemo(() => {
    if (!edition) return []
    const result: SkillGroup[] = []
    for (const cls of selectedClasses) {
      if (!cls.classId) continue
      const entries = getClassSkillEntries(cls.classId, edition)
      const className = classes.find(c => c.id === cls.classId)?.name ?? cls.classId
      for (const entry of entries) {
        if (entry.type !== 'choice') continue
        const count = entry.count ?? entry.slots ?? 0
        if (count === 0) continue
        result.push({
          classId: cls.classId,
          className,
          entry,
          options: entry.from ?? [],
          choiceCount: count,
          key: `${cls.classId}::skills`,
        })
      }
    }
    return result
  }, [selectedClasses, edition])

  // Total allowed across all groups
  const totalSlots = useMemo(
    () => skillGroups.reduce((sum, g) => sum + g.choiceCount, 0),
    [skillGroups],
  )

  const toggleSkill = useCallback(
    (skillId: string) => {
      const isSelected = selectedSkills.includes(skillId)
      const isLocked = lockedSkillIds.has(skillId)
      if (isSelected && isLocked) return

      let next: string[]
      if (isSelected) {
        next = selectedSkills.filter(id => id !== skillId)
      } else {
        if (selectedSkills.length >= totalSlots) return
        next = [...selectedSkills, skillId]
      }
      setProficiencies({ ...proficiencies, skills: next })
    },
    [selectedSkills, lockedSkillIds, totalSlots, proficiencies, setProficiencies],
  )

  if (skillGroups.length === 0) {
    return (
      <>
        <h2>Proficiencies</h2>
        <Typography color="text.secondary">
          No proficiency choices available. Select a class first.
        </Typography>
      </>
    )
  }

  const remaining = totalSlots - selectedSkills.length

  return (
    <>
      <h2>Choose Proficiencies</h2>

      <Stack spacing={2}>
        {skillGroups.map((group) => (
          <Card key={group.key} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {group.className} — Skills
                </Typography>
                <Chip
                  label={remaining > 0 ? `${remaining} remaining` : 'Complete'}
                  color={remaining > 0 ? 'warning' : 'success'}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Choose {group.choiceCount} from the options below.
              </Typography>

              {group.options.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {group.options.map((skillId) => {
                    const isChosen = selectedSkills.includes(skillId)
                    const isLocked = isChosen && lockedSkillIds.has(skillId)
                    const isNonInteractive = isLocked

                    return (
                      <Chip
                        key={skillId}
                        label={getSkillName(skillId, editionSkills)}
                        icon={isLocked ? <LockIcon sx={{ fontSize: 14 }} /> : undefined}
                        color={isChosen ? 'primary' : 'default'}
                        variant={isChosen ? 'filled' : 'outlined'}
                        onClick={isNonInteractive ? undefined : () => toggleSkill(skillId)}
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
        ))}
      </Stack>
    </>
  )
}

export default ProficiencyStep
