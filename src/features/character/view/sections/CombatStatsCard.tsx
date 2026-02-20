import { useState } from 'react'
import type { CharacterDoc, CharacterClassInfo } from '@/shared'
import { classes as classesData } from '@/data'
import { getById } from '@/domain/lookups'
import { getClassProgression } from '@/features/character/domain/progression'
import type { ClassProgression } from '@/data/classes/types'
import { useCombatStats } from '@/features/character/hooks'
import type { ArmorConfiguration } from '@/features/character/hooks/useCombatStats'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Link from '@mui/material/Link'
import { StatShield } from '@/ui/stats'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClassName(classId?: string): string {
  if (!classId) return 'Unknown'
  const c = getById(classesData, classId)
  return c?.name ?? classId
}

function formatHitDie(prog: ClassProgression): string {
  if (prog.hitDie === 0 && prog.hpPerLevel) return `${prog.hpPerLevel} HP/level`
  return `d${prog.hitDie}`
}

function formatSpellcasting(prog: ClassProgression): string | null {
  if (!prog.spellcasting || prog.spellcasting === 'none') return null
  const labels: Record<string, string> = {
    full: 'Full caster', half: 'Half caster', third: 'Third caster', pact: 'Pact magic',
  }
  return labels[prog.spellcasting] ?? prog.spellcasting
}

function formatAttackProg(prog: ClassProgression): string {
  return prog.attackProgression.charAt(0).toUpperCase() + prog.attackProgression.slice(1)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type CombatStatsCardProps = {
  character: CharacterDoc
  filledClasses: CharacterClassInfo[]
  isMulticlass: boolean
  canEditAll: boolean
  race: string
  alignment: string
  raceOptions: { id: string; label: string }[]
  alignmentOptions: { id: string; label: string }[]
  canEdit?: boolean
  onSave: (partial: Record<string, unknown>) => Promise<void>
}

export default function CombatStatsCard({
  character,
  filledClasses,
  isMulticlass,
  canEdit = false,
  onSave,
}: CombatStatsCardProps) {
  const { calculatedArmorClass, armorConfigurations, activeArmorConfig } = useCombatStats(character)
  const [configOpen, setConfigOpen] = useState(false)

  const hasCombat = true
  const hasMultipleConfigs = armorConfigurations.length > 1

  const handleConfigChange = async (configId: string) => {
    await onSave({ combat: { selectedArmorConfigId: configId } })
    setConfigOpen(false)
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
          Combat
        </Typography>

        {hasCombat ? (
          <Stack direction="row" spacing={3} sx={{ mt: 0.5, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <StatShield
                label="AC"
                value={calculatedArmorClass.value}
              />

              {activeArmorConfig && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', mt: 0.5 }}>
                  {activeArmorConfig.label}
                </Typography>
              )}

              {canEdit && hasMultipleConfigs && (
                <Link
                  component="button"
                  variant="caption"
                  onClick={() => setConfigOpen(prev => !prev)}
                  sx={{ fontSize: '0.65rem' }}
                >
                  {configOpen ? 'Hide' : 'Change'}
                </Link>
              )}

              {!hasMultipleConfigs && calculatedArmorClass && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                  {calculatedArmorClass.breakdown}
                </Typography>
              )}
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700}>
                {character.hitPoints?.total ?? '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">HP</Typography>
              {character.hitPoints?.generationMethod && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                  {character.hitPoints.generationMethod}
                </Typography>
              )}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>—</Typography>
        )}

        {/* Armor configuration selector */}
        <Collapse in={configOpen}>
          <Box sx={{ mb: 2, px: 0.5 }}>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
              Armor Configurations
            </Typography>
            <RadioGroup
              value={activeArmorConfig?.id ?? ''}
              onChange={(_, val) => handleConfigChange(val)}
            >
              {armorConfigurations.map((config: ArmorConfiguration) => (
                <FormControlLabel
                  key={config.id}
                  value={config.id}
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      <strong>{config.totalAC}</strong>
                      {'  '}
                      {config.breakdown}
                    </Typography>
                  }
                  sx={{ ml: 0, mr: 0, '.MuiFormControlLabel-label': { ml: 0.5 } }}
                />
              ))}
            </RadioGroup>
          </Box>
        </Collapse>

        {/* Class quick stats */}
        {filledClasses.map((cls, i) => {
          const prog = getClassProgression(cls.classId, character.edition)
          if (!prog) return null
          const spellLabel = formatSpellcasting(prog)
          return (
            <Box key={i} sx={{ mb: i < filledClasses.length - 1 ? 1.5 : 0 }}>
              {isMulticlass && (
                <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                  {getClassName(cls.classId)} {cls.level}
                </Typography>
              )}
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                <Chip label={`Hit Die: ${formatHitDie(prog)}`} size="small" variant="outlined" />
                <Chip label={`Attack: ${formatAttackProg(prog)}`} size="small" variant="outlined" />
                {prog.savingThrows && prog.savingThrows.length > 0 && (
                  <Chip label={`Saves: ${prog.savingThrows.map(s => s.toUpperCase()).join(', ')}`} size="small" variant="outlined" />
                )}
                {spellLabel && <Chip label={spellLabel} size="small" variant="outlined" />}
                {prog.role && (
                  <Chip label={`${prog.role}${prog.powerSource ? ` (${prog.powerSource})` : ''}`} size="small" variant="outlined" />
                )}
              </Stack>
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}
