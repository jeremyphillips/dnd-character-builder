import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import type { CharacterDoc } from '@/shared'
import { classes as classesData, editions, settings, races, type EditionId, type SettingId } from '@/data'
import { getNameById, getById } from '@/domain/lookups'
import { getAlignmentOptionsForCharacter, getSubclassNameById, getAllowedRaces, getClassProgression } from '@/domain/character'
import type { ClassProgression } from '@/data/classes/types'
import { spells as spellCatalog } from '@/data/classes/spells'
import { SpellHorizontalCard } from '@/domain/spells/components'
import {
  ImageUploadField,
  EditableTextField,
  EditableSelect,
  EditableNumberField,
} from '@/ui/fields'
import { StatCircle } from '@/ui/elements'
import { apiFetch } from '../../api'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CampaignSummary {
  _id: string
  name: string
  setting: string
  edition: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getAlignmentName = (options: { id: string; label: string }[], id: string | undefined): string => {
  if (!id) return '—'
  return getById(options, id)?.label ?? id
}

const getClassName = (classId?: string): string => {
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

export default function CharacterDetailRoute() {
  const { id } = useParams<{ id: string }>()
  useAuth()

  const [character, setCharacter] = useState<CharacterDoc | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [pendingMemberships, setPendingMemberships] = useState<
    { campaignId: string; campaignName: string; campaignMemberId: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Editable fields
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [narrative, setNarrative] = useState({
    personalityTraits: [] as string[],
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: '',
  })

  // Admin-only editable fields
  const [race, setRace] = useState('')
  const [alignment, setAlignment] = useState('')
  const [totalLevel, setTotalLevel] = useState(0)
  const [xp, setXp] = useState(0)

  // ── Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setLoading(true)
    apiFetch<{
      character: CharacterDoc
      campaigns: { _id: string; name: string; setting: string; edition: string }[]
      isOwner: boolean
      isAdmin: boolean
      pendingMemberships?: { campaignId: string; campaignName: string; campaignMemberId: string }[]
    }>(`/api/characters/${id}`)
      .then((data) => {
        const c = data.character
        setCharacter(c)
        setCampaigns(data.campaigns ?? [])
        setIsOwner(data.isOwner)
        setIsAdmin(data.isAdmin)
        setPendingMemberships(data.pendingMemberships ?? [])

        // Init editable state
        setName(c.name ?? '')
        setImageUrl(c.imageUrl ?? null)
        setNarrative({
          personalityTraits: c.narrative?.personalityTraits ?? [],
          ideals: c.narrative?.ideals ?? '',
          bonds: c.narrative?.bonds ?? '',
          flaws: c.narrative?.flaws ?? '',
          backstory: c.narrative?.backstory ?? '',
        })
        setRace(c.race ?? '')
        setAlignment(c.alignment ?? '')
        setTotalLevel(c.totalLevel ?? c.level ?? 0)
        setXp(c.xp ?? 0)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  const alignmentOptions = useMemo(() => {
    if (!character) return []
    const classIds = (character.classes ?? []).map((c) => c.classId).filter(Boolean) as string[]
    return getAlignmentOptionsForCharacter(character.edition as EditionId, classIds)
  }, [character?.edition, character?.classes])

  const raceOptions = useMemo(() => {
    if (!character) return []
    return getAllowedRaces(character.edition as EditionId, character.setting as SettingId).map((r) => ({
      id: r.id,
      label: r.name,
    }))
  }, [character?.edition, character?.setting])

  const syncFromCharacter = (c: CharacterDoc) => {
    setName(c.name ?? '')
    setImageUrl(c.imageUrl ?? null)
    setNarrative({
      personalityTraits: c.narrative?.personalityTraits ?? [],
      ideals: c.narrative?.ideals ?? '',
      bonds: c.narrative?.bonds ?? '',
      flaws: c.narrative?.flaws ?? '',
      backstory: c.narrative?.backstory ?? '',
    })
    setRace(c.race ?? '')
    setAlignment(c.alignment ?? '')
    setTotalLevel(c.totalLevel ?? c.level ?? 0)
    setXp(c.xp ?? 0)
  }

  const handleApprove = async (campaignMemberId: string) => {
    setApprovingId(campaignMemberId)
    setError(null)
    try {
      await apiFetch(`/api/campaign-members/${campaignMemberId}/approve`, { method: 'POST' })
      setPendingMemberships((prev) => prev.filter((m) => m.campaignMemberId !== campaignMemberId))
      setSuccess('Character approved for campaign')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setApprovingId(null)
    }
  }

  const handleReject = async (campaignMemberId: string) => {
    setApprovingId(campaignMemberId)
    setError(null)
    try {
      await apiFetch(`/api/campaign-members/${campaignMemberId}/reject`, { method: 'POST' })
      setPendingMemberships((prev) => prev.filter((m) => m.campaignMemberId !== campaignMemberId))
      setSuccess('Character rejected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setApprovingId(null)
    }
  }

  const saveCharacter = async (partial: Record<string, unknown>) => {
    if (!id) return
    setError(null)
    setSuccess(null)
    try {
      const data = await apiFetch<{ character: CharacterDoc }>(`/api/characters/${id}`, {
        method: 'PATCH',
        body: partial,
      })
      setCharacter(data.character)
      syncFromCharacter(data.character)
      setSuccess('Saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
      throw err
    }
  }

  // ── Render ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !character) {
    return (
      <Box sx={{ maxWidth: 520, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!character) return null

  const canEditAll = isAdmin
  const canEdit = isOwner || isAdmin

  const filledClasses = (character.classes ?? []).filter((c) => c.classId)
  const isMulticlass = filledClasses.length > 1

  const editionName = getNameById(editions as unknown as { id: string; name: string }[], character.edition) ?? character.edition ?? '—'
  const settingName = getNameById(settings as unknown as { id: string; name: string }[], character.setting) ?? character.setting ?? '—'

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      {/* Back link */}
      <Button
        component={Link}
        to="/characters"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Characters
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Pending approval alert — campaign admin can approve/reject */}
      {pendingMemberships.map((m) => (
        <Alert
          key={m.campaignMemberId}
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApprove(m.campaignMemberId)}
                disabled={approvingId !== null}
              >
                Approve
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleReject(m.campaignMemberId)}
                disabled={approvingId !== null}
              >
                Reject
              </Button>
            </Stack>
          }
        >
          {character?.name} is pending approval for {m.campaignName}.
        </Alert>
      ))}

      {/* ================================================================ */}
      {/* Header: Image + Name                                              */}
      {/* ================================================================ */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">Character Portrait</Typography>
          <ImageUploadField
            value={imageUrl}
            onChange={(url) => {
              setImageUrl(url)
              saveCharacter({ imageUrl: url })
            }}
            label=""
            disabled={!canEdit}
            maxHeight={320}
          />

          <Box sx={{ mt: 2 }}>
            <EditableTextField
              label="Character Name"
              value={name}
              onSave={(v: string) => saveCharacter({ name: v })}
              disabled={!canEdit}
            />
          </Box>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Character Sheet                                                   */}
      {/* ================================================================ */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Character Sheet
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Edition</Typography>
              <Typography variant="body1">{editionName}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Setting</Typography>
              <Typography variant="body1">{settingName}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              {canEditAll ? (
                <EditableSelect
                  label="Race"
                  value={race}
                  onSave={(v: string) => saveCharacter({ race: v })}
                  options={raceOptions}
                />
              ) : (
                <>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Race</Typography>
                  <Typography variant="body1">
                    {(getNameById(races as unknown as { id: string; name: string }[], character.race) ?? character.race) || '—'}
                  </Typography>
                </>
              )}
            </Grid>
            <Grid size={{ xs: 6 }}>
              {canEditAll ? (
                <EditableSelect
                  label="Alignment"
                  value={alignment}
                  onSave={(v: string) => saveCharacter({ alignment: v })}
                  options={alignmentOptions}
                  emptyLabel="—"
                />
              ) : (
                <>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Alignment</Typography>
                  <Typography variant="body1">{getAlignmentName(alignmentOptions, character.alignment)}</Typography>
                </>
              )}
            </Grid>
            <Grid size={{ xs: 6 }}>
              {canEditAll ? (
                <EditableNumberField
                  label="Level"
                  value={totalLevel}
                  onSave={(v: number) => saveCharacter({ totalLevel: v, level: v })}
                />
              ) : (
                <>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Level</Typography>
                  <Typography variant="body1">{character.totalLevel ?? character.level ?? '—'}</Typography>
                </>
              )}
            </Grid>
            <Grid size={{ xs: 6 }}>
              {canEditAll ? (
                <EditableNumberField
                  label="XP"
                  value={xp}
                  onSave={(v: number) => saveCharacter({ xp: v })}
                  formatDisplay={(n) => n.toLocaleString()}
                />
              ) : (
                <>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>XP</Typography>
                  <Typography variant="body1">{(character.xp ?? 0).toLocaleString()}</Typography>
                </>
              )}
            </Grid>
          </Grid>

          {/* Classes */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Classes</Typography>
          {filledClasses.length > 0 ? (
            filledClasses.map((cls, i) => {
              const subName = getSubclassNameById(cls.classId, cls.classDefinitionId)
              return (
                <Typography key={i} variant="body1">
                  {getClassName(cls.classId)}
                  {subName ? `, ${subName}` : ''}
                  {' '}Level {cls.level}
                  {i === 0 && isMulticlass ? ' (primary)' : ''}
                </Typography>
              )
            })
          ) : (
            <Typography variant="body2" color="text.secondary">
              {character.class ? `${character.class} Level ${character.level}` : '—'}
            </Typography>
          )}

          {/* Equipment */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Equipment</Typography>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 4 }}>
              <Typography variant="caption" color="text.secondary">Weapons</Typography>
              {(character.equipment?.weapons ?? []).length > 0 ? (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                  {(character.equipment?.weapons ?? []).map((w, i) => (
                    <Chip key={i} label={w} size="small" variant="outlined" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2">—</Typography>
              )}
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Typography variant="caption" color="text.secondary">Armor</Typography>
              {(character.equipment?.armor ?? []).length > 0 ? (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                  {(character.equipment?.armor ?? []).map((a, i) => (
                    <Chip key={i} label={a} size="small" variant="outlined" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2">—</Typography>
              )}
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Typography variant="caption" color="text.secondary">Gear</Typography>
              {(character.equipment?.gear ?? []).length > 0 ? (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                  {(character.equipment?.gear ?? []).map((g, i) => (
                    <Chip key={i} label={g} size="small" variant="outlined" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2">—</Typography>
              )}
            </Grid>
          </Grid>
          {(character.equipment?.weight ?? 0) > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Total weight: {character.equipment?.weight ?? 0} lbs
            </Typography>
          )}

          {/* Wealth */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Wealth</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant="body2">{character.wealth?.gp ?? 0} gp</Typography>
            <Typography variant="body2">{character.wealth?.sp ?? 0} sp</Typography>
            <Typography variant="body2">{character.wealth?.cp ?? 0} cp</Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Class Progression                                                 */}
      {/* ================================================================ */}
      {filledClasses.some((cls) => getClassProgression(cls.classId, character.edition)) && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Class Progression
            </Typography>

            {filledClasses.map((cls, i) => {
              const prog = getClassProgression(cls.classId, character.edition)
              if (!prog) return null

              const spellLabel = formatSpellcasting(prog)
              const currentLevel = cls.level ?? character.totalLevel ?? 1
              const activeFeatures = (prog.features ?? []).filter((f) => f.level <= currentLevel)

              return (
                <Box key={i} sx={{ mb: i < filledClasses.length - 1 ? 3 : 0 }}>
                  {isMulticlass && (
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {getClassName(cls.classId)} (Level {cls.level})
                    </Typography>
                  )}

                  {/* Quick stats */}
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                    <Chip label={`Hit Die: ${formatHitDie(prog)}`} size="small" variant="outlined" />
                    <Chip label={`Attack: ${formatAttackProg(prog)}`} size="small" variant="outlined" />
                    {prog.savingThrows && prog.savingThrows.length > 0 && (
                      <Chip
                        label={`Saves: ${prog.savingThrows.map((s) => s.toUpperCase()).join(', ')}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {spellLabel && <Chip label={spellLabel} size="small" variant="outlined" />}
                    {prog.role && (
                      <Chip
                        label={`${prog.role}${prog.powerSource ? ` (${prog.powerSource})` : ''}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {/* Features list */}
                  {activeFeatures.length > 0 && (
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Features (up to Level {currentLevel})
                      </Typography>
                      <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                        {activeFeatures.map((f, fi) => (
                          <Typography key={fi} variant="body2">
                            <Typography component="span" variant="body2" color="text.secondary" sx={{ minWidth: 36, display: 'inline-block' }}>
                              Lv {f.level}
                            </Typography>
                            {' '}{f.name}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* Spells                                                             */}
      {/* ================================================================ */}
      {(character.spells ?? []).length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Spells
            </Typography>
            <Stack spacing={1}>
              {(character.spells ?? []).map(spellId => {
                const spell = spellCatalog.find(s => s.id === spellId)
                if (!spell) {
                  return (
                    <Chip key={spellId} label={spellId} size="small" variant="outlined" />
                  )
                }
                const editionEntry = spell.editions.find(e => e.edition === character.edition)
                return (
                  <SpellHorizontalCard
                    key={spellId}
                    spell={spell}
                    editionEntry={editionEntry}
                  />
                )
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* Stats (AI-generated)                                              */}
      {/* ================================================================ */}
      {character.stats && Object.values(character.stats).some((v) => v != null) && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Ability Scores
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
              <StatCircle label="STR" value={character.stats.strength} />
              <StatCircle label="DEX" value={character.stats.dexterity} />
              <StatCircle label="CON" value={character.stats.constitution} />
              <StatCircle label="INT" value={character.stats.intelligence} />
              <StatCircle label="WIS" value={character.stats.wisdom} />
              <StatCircle label="CHA" value={character.stats.charisma} />
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* Combat: HP + AC                                                   */}
      {/* ================================================================ */}
      {(character.hitPoints?.total != null || character.armorClass?.current != null) && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Combat
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Hit Points</Typography>
                <Typography variant="h4" fontWeight={700}>{character.hitPoints?.total ?? '—'}</Typography>
                {character.hitPoints?.generationMethod && (
                  <Typography variant="caption" color="text.secondary">
                    Method: {character.hitPoints.generationMethod}
                  </Typography>
                )}
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Armor Class</Typography>
                <Typography variant="h4" fontWeight={700}>{character.armorClass?.current ?? character.armorClass?.base ?? '—'}</Typography>
                {character.armorClass?.calculation && (
                  <Typography variant="caption" color="text.secondary">
                    {character.armorClass.calculation}
                  </Typography>
                )}
              </Grid>
            </Grid>

            {/* Proficiencies */}
            {(character.proficiencies ?? []).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Proficiencies</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                  {(character.proficiencies ?? []).map((p, i) => (
                    <Chip key={i} label={typeof p === 'string' ? p : p.name} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* Narrative (editable by owner + admins)                            */}
      {/* ================================================================ */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Narrative
          </Typography>

          <Stack spacing={2}>
            <EditableTextField
              label="Personality Traits"
              value={narrative.personalityTraits.join(', ')}
              onSave={(v: string) =>
                saveCharacter({
                  narrative: {
                    ...narrative,
                    personalityTraits: v.split(',').map((s: string) => s.trim()).filter(Boolean),
                  },
                })
              }
              disabled={!canEdit}
              multiline
              minRows={2}
              helperText="Comma-separated"
            />
            <EditableTextField
              label="Ideals"
              value={narrative.ideals}
              onSave={(v: string) => saveCharacter({ narrative: { ...narrative, ideals: v } })}
              disabled={!canEdit}
              multiline
              minRows={2}
            />
            <EditableTextField
              label="Bonds"
              value={narrative.bonds}
              onSave={(v: string) => saveCharacter({ narrative: { ...narrative, bonds: v } })}
              disabled={!canEdit}
              multiline
              minRows={2}
            />
            <EditableTextField
              label="Flaws"
              value={narrative.flaws}
              onSave={(v: string) => saveCharacter({ narrative: { ...narrative, flaws: v } })}
              disabled={!canEdit}
              multiline
              minRows={2}
            />
            <EditableTextField
              label="Backstory"
              value={narrative.backstory}
              onSave={(v: string) => saveCharacter({ narrative: { ...narrative, backstory: v } })}
              disabled={!canEdit}
              multiline
              minRows={4}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* Campaigns                                                         */}
      {/* ================================================================ */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Campaigns
          </Typography>
          {campaigns.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Not part of any campaigns.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {campaigns.map((c) => (
                <Stack key={c._id} direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body1" fontWeight={600}>
                    {c.name}
                  </Typography>
                  <Chip label={c.setting} size="small" variant="outlined" />
                  <Chip label={c.edition} size="small" variant="outlined" />
                  <Button
                    component={Link}
                    to={`/campaigns/${c._id}`}
                    size="small"
                  >
                    View
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

    </Box>
  )
}
