import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import type { CharacterDoc } from '@/shared'
import { classes as classesData, editions, settings, races, equipment, type EditionId, type SettingId } from '@/data'
import { getNameById, getById } from '@/domain/lookups'
import { getAlignmentOptionsForCharacter, getSubclassNameById, getAllowedRaces, getClassProgression, getXpByLevelAndEdition, getLevelForXp } from '@/domain/character'
import { AwardXpModal } from '@/domain/character/components/AwardXpModal'
import { ConfirmModal } from '@/ui/modals'
import { LevelUpWizard } from '@/features/levelUp'
import type { LevelUpResult } from '@/features/levelUp'
import { getMagicItemBudget, resolveEquipmentEdition } from '@/domain/equipment'
import type { MagicItem, MagicItemEditionDatum } from '@/data/equipment/magicItems.types'
import type { ClassProgression } from '@/data/classes/types'
import { spells as spellCatalog } from '@/data/classes/spells'
import { SpellHorizontalCard } from '@/domain/spells/components'
import CampaignHorizontalCard from '@/domain/campaign/components/CampaignHorizontalCard/CampaignHorizontalCard'
import {
  ImageUploadField,
  EditableTextField,
  EditableSelect,
  EditableNumberField,
} from '@/ui/fields'
import { StatCircle, Breadcrumbs } from '@/ui/elements'
import { useBreadcrumbs } from '@/hooks'
import { apiFetch } from '@/app/api'
import { ROUTES } from '@/app/routes'

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

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CampaignSummary {
  _id: string
  identity: {
    name: string
    setting?: string
    edition?: string
    description?: string
    imageUrl?: string
  }
  dmName?: string
  campaignMemberId?: string
  characterStatus?: string
  memberCount?: number
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

function formatAttunement(val: boolean | string | undefined): string | null {
  if (val === true) return 'Requires attunement'
  if (typeof val === 'string') return `Attunement ${val}`
  return null
}

function formatRarity(rarity: string): string {
  return rarity
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatSlot(slot: string): string {
  return slot.charAt(0).toUpperCase() + slot.slice(1)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CharacterRoute() {
  const { id } = useParams<{ id: string }>()
  useAuth()

  const [character, setCharacter] = useState<CharacterDoc | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [ownerName, setOwnerName] = useState<string | undefined>()
  const [pendingMemberships, setPendingMemberships] = useState<
    { campaignId: string; campaignName: string; campaignMemberId: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Editable fields
  const [name, setName] = useState('')
  const [imageKey, setImageKey] = useState<string | null>(null)
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
  const [awardXpOpen, setAwardXpOpen] = useState(false)
  const [levelUpOpen, setLevelUpOpen] = useState(false)
  const [cancelLevelUpOpen, setCancelLevelUpOpen] = useState(false)
  const [statusAction, setStatusAction] = useState<{
    campaignMemberId: string
    campaignName: string
    newStatus: 'inactive' | 'deceased'
  } | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const navigate = useNavigate()
  const breadcrumbs = useBreadcrumbs()

  // ── Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setLoading(true)
    apiFetch<{
      character: CharacterDoc
      campaigns: CampaignSummary[]
      isOwner: boolean
      isAdmin: boolean
      pendingMemberships?: { campaignId: string; campaignName: string; campaignMemberId: string }[]
      ownerName?: string
    }>(`/api/characters/${id}`)
      .then((data) => {
        const c = data.character
        setCharacter(c)
        setCampaigns(data.campaigns ?? [])
        setIsOwner(data.isOwner)
        setIsAdmin(data.isAdmin)
        setPendingMemberships(data.pendingMemberships ?? [])
        setOwnerName(data.ownerName)

        // Init editable state
        setName(c.name ?? '')
        setImageKey(c.imageKey ?? null)
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
    setImageKey(c.imageKey ?? null)
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

  const handleAwardXp = async (params: {
    newXp: number
    triggersLevelUp: boolean
    pendingLevel?: number
  }) => {
    if (!id) return
    const body: Record<string, unknown> = { xp: params.newXp }
    if (params.triggersLevelUp && params.pendingLevel) {
      body.levelUpPending = true
      body.pendingLevel = params.pendingLevel
    }
    const data = await apiFetch<{ character: CharacterDoc }>(`/api/characters/${id}`, {
      method: 'PATCH',
      body,
    })
    setCharacter(data.character)
    syncFromCharacter(data.character)
  }

  const handleCancelLevelUp = async () => {
    if (!id || !character) return
    // Revert XP to the threshold for the current level
    const revertedXp = getXpByLevelAndEdition(currentLevel, character.edition as EditionId, primaryClassId)
    const data = await apiFetch<{ character: CharacterDoc }>(`/api/characters/${id}`, {
      method: 'PATCH',
      body: {
        xp: revertedXp,
        levelUpPending: false,
        pendingLevel: null,
      },
    })
    setCharacter(data.character)
    syncFromCharacter(data.character)
    setCancelLevelUpOpen(false)
    setSuccess('Level-up cancelled. XP has been reverted.')
  }

  const handleCharacterStatusChange = async () => {
    if (!statusAction) return
    try {
      await apiFetch(`/api/campaign-members/${statusAction.campaignMemberId}/character-status`, {
        method: 'PATCH',
        body: { characterStatus: statusAction.newStatus },
      })
      // Update local campaign list
      setCampaigns(prev =>
        prev.map(c =>
          c.campaignMemberId === statusAction.campaignMemberId
            ? { ...c, characterStatus: statusAction.newStatus }
            : c,
        ),
      )
      const label = statusAction.newStatus === 'deceased' ? 'marked as deceased' : 'set to inactive'
      setSuccess(`${character?.name ?? 'Character'} has been ${label} in ${statusAction.campaignName}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character status')
    } finally {
      setStatusAction(null)
    }
  }

  const handleReactivate = async (campaignMemberId: string, campaignName: string) => {
    try {
      await apiFetch(`/api/campaign-members/${campaignMemberId}/character-status`, {
        method: 'PATCH',
        body: { characterStatus: 'active' },
      })
      setCampaigns(prev =>
        prev.map(c =>
          c.campaignMemberId === campaignMemberId
            ? { ...c, characterStatus: 'active' }
            : c,
        ),
      )
      setSuccess(`${character?.name ?? 'Character'} has been reactivated in ${campaignName}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate character')
    }
  }

  const handleDeleteCharacter = async () => {
    if (!id) return
    try {
      await apiFetch(`/api/characters/${id}`, { method: 'DELETE' })
      navigate(ROUTES.CHARACTERS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character')
      setDeleteOpen(false)
    }
  }

  const handleLevelUpComplete = async (result: LevelUpResult) => {
    if (!id) return
    const body: Record<string, unknown> = {
      totalLevel: result.totalLevel,
      classes: result.classes,
      hitPoints: result.hitPoints,
      spells: result.spells,
      levelUpPending: false,
      pendingLevel: null,
    }
    if (result.classDefinitionId) {
      // Update the primary class's subclass in the classes array already,
      // but also persist at the document level if needed
      body.classDefinitionId = result.classDefinitionId
    }
    const data = await apiFetch<{ character: CharacterDoc }>(`/api/characters/${id}`, {
      method: 'PATCH',
      body,
    })
    setCharacter(data.character)
    syncFromCharacter(data.character)
    setSuccess(`${character?.name ?? 'Character'} has been advanced to level ${result.totalLevel}!`)
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
  const activeCampaignCount = campaigns.filter(c => (c.characterStatus ?? 'active') === 'active').length

  const filledClasses = (character.classes ?? []).filter((c) => c.classId)
  const isMulticlass = filledClasses.length > 1

  const editionName = getNameById(editions as unknown as { id: string; name: string }[], character.edition) ?? character.edition ?? '—'
  const settingName = getNameById(settings as unknown as { id: string; name: string }[], character.setting) ?? character.setting ?? '—'

  // ── Pre-compute data for render ──────────────────────────────────────
  const raceName = (getNameById(races as unknown as { id: string; name: string }[], character.race) ?? character.race) || '—'
  const alignmentName = getAlignmentName(alignmentOptions, character.alignment)
  const currentLevel = character.totalLevel ?? character.level ?? 1
  const primaryClassId = filledClasses[0]?.classId
  const editionObj = editions.find(e => e.id === character.edition)
  const maxLevel = editionObj?.progression?.maxLevel ?? 20

  // Class summary line: "Fighter 9 / Wizard 3" or "Fighter 9"
  const classSummary = filledClasses.length > 0
    ? filledClasses.map(cls => {
        const sub = getSubclassNameById(cls.classId, cls.classDefinitionId)
        return `${getClassName(cls.classId)}${sub ? ` (${sub})` : ''} ${cls.level}`
      }).join(' / ')
    : character.class
      ? `${character.class} ${character.level}`
      : '—'

  // XP description — context-aware for pending level-ups
  const isPendingLevelUp = character.levelUpPending && character.pendingLevel
  let xpDescription: string | undefined
  if (isPendingLevelUp) {
    // Character already has the XP — show the pending target instead of the
    // stale "XP required for next level" message
    const effectiveLevel = character.pendingLevel!
    if (effectiveLevel >= maxLevel) {
      xpDescription = `Level-up to ${effectiveLevel} pending · Max level`
    } else {
      const beyondPendingXp = getXpByLevelAndEdition(effectiveLevel + 1, character.edition as EditionId, primaryClassId)
      xpDescription = beyondPendingXp > 0
        ? `Level-up to ${effectiveLevel} pending · ${beyondPendingXp.toLocaleString()} XP for level ${effectiveLevel + 1}`
        : `Level-up to ${effectiveLevel} pending`
    }
  } else if (currentLevel >= maxLevel) {
    xpDescription = `Max level (${maxLevel}) reached`
  } else {
    const nextLevelXp = getXpByLevelAndEdition(currentLevel + 1, character.edition as EditionId, primaryClassId)
    if (nextLevelXp > 0) {
      xpDescription = `${nextLevelXp.toLocaleString()} XP required for level ${currentLevel + 1}`
    }
  }

  // Magic items
  const charMagicItemIds = character.equipment?.magicItems ?? []
  const effectiveEdition = character.edition ? resolveEquipmentEdition(character.edition) : undefined
  const magicItemBudget = getMagicItemBudget(character.edition as EditionId, currentLevel)

  const resolvedMagicItems = charMagicItemIds
    .map(itemId => {
      const item = equipment.magicItems.find((m: MagicItem) => m.id === itemId)
      if (!item) return null
      const datum = effectiveEdition
        ? item.editionData.find((d: MagicItemEditionDatum) => d.edition === effectiveEdition)
        : undefined
      return { item, datum }
    })
    .filter(Boolean) as { item: MagicItem; datum?: MagicItemEditionDatum }[]

  const permanentMagicCount = resolvedMagicItems.filter(r => !r.item.consumable).length
  const consumableMagicCount = resolvedMagicItems.filter(r => r.item.consumable).length

  const hasMagicBudget = magicItemBudget != null
  const permanentSlotsAvail = hasMagicBudget ? magicItemBudget.permanentSlots - permanentMagicCount : 0
  const consumableSlotsAvail = hasMagicBudget ? magicItemBudget.consumableSlots - consumableMagicCount : 0
  const hasAvailableMagicSlots = permanentSlotsAvail > 0 || consumableSlotsAvail > 0

  const hasStats = character.stats && Object.values(character.stats).some(v => v != null)
  const hasCombat = character.hitPoints?.total != null || character.armorClass?.current != null

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto' }}>
      <Breadcrumbs items={breadcrumbs} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Pending approval alerts */}
      {pendingMemberships.map((m) => (
        <Alert
          key={m.campaignMemberId}
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleApprove(m.campaignMemberId)} disabled={approvingId !== null}>
                Approve
              </Button>
              <Button size="small" color="error" startIcon={<CancelIcon />} onClick={() => handleReject(m.campaignMemberId)} disabled={approvingId !== null}>
                Reject
              </Button>
            </Stack>
          }
        >
          {character?.name} is pending approval for {m.campaignName}.
        </Alert>
      ))}

      {/* Level-up pending banner */}
      {character.levelUpPending && character.pendingLevel && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            isOwner ? (
              <Button
                size="small"
                variant="contained"
                onClick={() => setLevelUpOpen(true)}
              >
                Begin Level-Up
              </Button>
            ) : undefined
          }
        >
          {isOwner ? (
            <>
              <strong>{character.name}</strong> is pending advancement to level{' '}
              <strong>{character.pendingLevel}</strong>. Complete your level-up to
              choose new features, spells, and abilities.
            </>
          ) : (
            <>
              <strong>{character.name}</strong> is pending advancement to level{' '}
              <strong>{character.pendingLevel}</strong>. Waiting for{' '}
              <strong>{ownerName ?? 'the character owner'}</strong> to complete
              the level-up process.
              {canEditAll && (
                <>
                  {' '}
                  <Typography
                    component="span"
                    variant="body2"
                    color="primary"
                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => setCancelLevelUpOpen(true)}
                  >
                    Cancel level-up
                  </Typography>
                </>
              )}
            </>
          )}
        </Alert>
      )}

      {/* ================================================================ */}
      {/* IDENTITY BANNER                                                   */}
      {/* ================================================================ */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ pb: '16px !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
            {/* Portrait */}
            <Box sx={{ width: { xs: '100%', sm: 160 }, flexShrink: 0 }}>
              <ImageUploadField
                value={imageKey}
                onChange={(key) => { setImageKey(key); saveCharacter({ imageKey: key }) }}
                label=""
                disabled={!canEdit}
                maxHeight={180}
              />
            </Box>

            {/* Identity text */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <EditableTextField
                label="Character Name"
                value={name}
                onSave={(v: string) => saveCharacter({ name: v })}
                disabled={!canEdit}
              />

              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {classSummary}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Chip label={raceName} size="small" variant="outlined" />
                <Chip label={alignmentName} size="small" variant="outlined" />
                <Chip label={editionName} size="small" variant="outlined" />
                <Chip label={settingName} size="small" variant="outlined" />
              </Stack>

              {/* Level + XP inline */}
              <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                <Box>
                  {canEditAll ? (
                    <EditableNumberField
                      label="Level"
                      value={totalLevel}
                      onSave={(v: number) => saveCharacter({ totalLevel: v, level: v })}
                    />
                  ) : (
                    <>
                      <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Level</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="baseline">
                        <Typography variant="body1" fontWeight={600}>{currentLevel}</Typography>
                        {isPendingLevelUp && (
                          <Typography variant="body2" color="info.main" fontWeight={500}>
                            &rarr; {character.pendingLevel}
                          </Typography>
                        )}
                      </Stack>
                    </>
                  )}
                </Box>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>XP</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" fontWeight={600}>{(character.xp ?? 0).toLocaleString()}</Typography>
                    {canEditAll && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setAwardXpOpen(true)}
                        disabled={!!isPendingLevelUp}
                      >
                        Award XP
                      </Button>
                    )}
                  </Stack>
                  {xpDescription && (
                    <Typography variant="caption" color="text.secondary">{xpDescription}</Typography>
                  )}
                </Box>
              </Stack>

              {/* Campaigns */}
              {campaigns.length > 0 && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                    Campaigns
                  </Typography>
                  {campaigns.map(c => {
                    const charStatus = (c.characterStatus ?? 'active') as string
                    const isActive = charStatus === 'active'

                    const campaignActions = (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {/* Campaign admin: set inactive / deceased / reactivate */}
                        {isAdmin && c.campaignMemberId && isActive && (
                          <>
                            <Typography
                              variant="body2"
                              color="warning.main"
                              sx={{ fontSize: '0.75rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                              onClick={(e) => { e.preventDefault(); setStatusAction({ campaignMemberId: c.campaignMemberId!, campaignName: c.identity.name, newStatus: 'inactive' }) }}
                            >
                              Set inactive
                            </Typography>
                            <Typography
                              variant="body2"
                              color="error.main"
                              sx={{ fontSize: '0.75rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                              onClick={(e) => { e.preventDefault(); setStatusAction({ campaignMemberId: c.campaignMemberId!, campaignName: c.identity.name, newStatus: 'deceased' }) }}
                            >
                              Mark deceased
                            </Typography>
                          </>
                        )}
                        {isAdmin && c.campaignMemberId && !isActive && (
                          <Typography
                            variant="body2"
                            color="primary"
                            sx={{ fontSize: '0.75rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={(e) => { e.preventDefault(); handleReactivate(c.campaignMemberId!, c.identity.name) }}
                          >
                            Reactivate
                          </Typography>
                        )}
                        {/* Character owner (non-admin): leave campaign */}
                        {isOwner && !isAdmin && c.campaignMemberId && isActive && (
                          <Typography
                            variant="body2"
                            color="warning.main"
                            sx={{ fontSize: '0.75rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            onClick={(e) => { e.preventDefault(); setStatusAction({ campaignMemberId: c.campaignMemberId!, campaignName: c.identity.name, newStatus: 'inactive' }) }}
                          >
                            Leave campaign
                          </Typography>
                        )}
                      </Stack>
                    )

                    return (
                      <CampaignHorizontalCard
                        key={c._id}
                        campaignId={c._id}
                        name={c.identity.name}
                        description={c.identity.description}
                        imageUrl={c.identity.imageUrl}
                        dmName={c.dmName}
                        edition={c.identity.edition}
                        setting={c.identity.setting}
                        memberCount={c.memberCount}
                        characterStatus={charStatus !== 'active' ? charStatus : undefined}
                        actions={campaignActions}
                      />
                    )
                  })}
                </Stack>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* ROW 2: Ability Scores | Combat + Class Stats | Proficiencies      */}
      {/* ================================================================ */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* ── Ability Scores (left sidebar) ── */}
        {hasStats && (
          <Grid size={{ xs: 12, md: 2 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ px: 1.5, py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block', textAlign: 'center', mb: 1 }}>
                  Ability Scores
                </Typography>
                <Stack spacing={1} alignItems="center">
                  <StatCircle label="Strength" value={character.stats!.strength} />
                  <StatCircle label="Dexterity" value={character.stats!.dexterity} />
                  <StatCircle label="Constitution" value={character.stats!.constitution} />
                  <StatCircle label="Intelligence" value={character.stats!.intelligence} />
                  <StatCircle label="Wisdom" value={character.stats!.wisdom} />
                  <StatCircle label="Charisma" value={character.stats!.charisma} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* ── Combat + Class Quick Stats (center) ── */}
        <Grid size={{ xs: 12, md: hasStats ? 6 : 7 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Combat
              </Typography>

              {hasCombat ? (
                <Stack direction="row" spacing={3} sx={{ mt: 0.5, mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700}>{character.armorClass?.current ?? character.armorClass?.base ?? '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">AC</Typography>
                    {character.armorClass?.calculation && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                        {character.armorClass.calculation}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={700}>{character.hitPoints?.total ?? '—'}</Typography>
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

              {/* Class quick stats (hit die, attack, saves, spellcasting) */}
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

              {/* Admin-editable race + alignment */}
              {canEditAll && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <EditableSelect
                        label="Race"
                        value={race}
                        onSave={(v: string) => saveCharacter({ race: v })}
                        options={raceOptions}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <EditableSelect
                        label="Alignment"
                        value={alignment}
                        onSave={(v: string) => saveCharacter({ alignment: v })}
                        options={alignmentOptions}
                        emptyLabel="—"
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Proficiencies (right) ── */}
        <Grid size={{ xs: 12, md: hasStats ? 4 : 5 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Proficiencies
              </Typography>
              {(character.proficiencies ?? []).length > 0 ? (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                  {(character.proficiencies ?? []).map((p, i) => (
                    <Chip key={i} label={typeof p === 'string' ? p : p.name} size="small" variant="outlined" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>—</Typography>
              )}

              {/* Wealth */}
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Wealth
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>{character.wealth?.gp ?? 0} gp</Typography>
                <Typography variant="body2">{character.wealth?.sp ?? 0} sp</Typography>
                <Typography variant="body2">{character.wealth?.cp ?? 0} cp</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================================================================ */}
      {/* ROW 3: Equipment | Magic Items                                    */}
      {/* ================================================================ */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* ── Equipment (left) ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Equipment
              </Typography>

              {/* Weapons */}
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Weapons</Typography>
                {(character.equipment?.weapons ?? []).length > 0 ? (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    {(character.equipment?.weapons ?? []).map((w, i) => (
                      <Chip key={i} label={w} size="small" variant="outlined" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </Box>

              {/* Armor */}
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Armor</Typography>
                {(character.equipment?.armor ?? []).length > 0 ? (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    {(character.equipment?.armor ?? []).map((a, i) => (
                      <Chip key={i} label={a} size="small" variant="outlined" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </Box>

              {/* Gear */}
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Gear</Typography>
                {(character.equipment?.gear ?? []).length > 0 ? (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    {(character.equipment?.gear ?? []).map((g, i) => (
                      <Chip key={i} label={g} size="small" variant="outlined" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </Box>

              {(character.equipment?.weight ?? 0) > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                  Total weight: {character.equipment?.weight ?? 0} lbs
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Magic Items (right) ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Magic Items
              </Typography>

              {resolvedMagicItems.length > 0 ? (
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {resolvedMagicItems.map(({ item, datum }) => {
                    const attunement = formatAttunement(datum?.requiresAttunement)
                    return (
                      <Box key={item.id}>
                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                          {datum?.rarity && <Chip label={formatRarity(datum.rarity)} size="small" variant="outlined" />}
                          <Chip label={formatSlot(item.slot)} size="small" variant="outlined" />
                          {item.consumable && <Chip label="Consumable" size="small" color="warning" variant="outlined" />}
                          {attunement && <Chip label={attunement} size="small" color="info" variant="outlined" />}
                          {datum?.bonus != null && <Chip label={`+${datum.bonus}`} size="small" variant="outlined" />}
                        </Stack>
                        {datum?.effect && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>{datum.effect}</Typography>
                        )}
                        {datum?.charges != null && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Charges: {datum.charges}{datum.recharges ? ` (recharges ${datum.recharges})` : ''}
                          </Typography>
                        )}
                        {datum?.cost && datum.cost !== '—' && (
                          <Typography variant="caption" color="text.secondary" display="block">Value: {datum.cost}</Typography>
                        )}
                      </Box>
                    )
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>—</Typography>
              )}

              {/* Budget summary */}
              {hasMagicBudget && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Budget: {permanentMagicCount} / {magicItemBudget.permanentSlots} permanent
                    {' · '}{consumableMagicCount} / {magicItemBudget.consumableSlots} consumable
                    {magicItemBudget.maxAttunement != null && <> · {magicItemBudget.maxAttunement} attunement slots</>}
                  </Typography>
                  {hasAvailableMagicSlots && (
                    <Alert severity="info" icon={<InfoOutlinedIcon fontSize="small" />} sx={{ mt: 1, py: 0.25 }}>
                      <Typography variant="caption">
                        This character can acquire
                        {permanentSlotsAvail > 0 && <> <strong>{permanentSlotsAvail}</strong> more permanent item{permanentSlotsAvail !== 1 ? 's' : ''}</>}
                        {permanentSlotsAvail > 0 && consumableSlotsAvail > 0 && ' and'}
                        {consumableSlotsAvail > 0 && <> <strong>{consumableSlotsAvail}</strong> more consumable{consumableSlotsAvail !== 1 ? 's' : ''}</>}
                        {' '}based on their level progression.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================================================================ */}
      {/* CLASS FEATURES (full width)                                       */}
      {/* ================================================================ */}
      {filledClasses.some(cls => getClassProgression(cls.classId, character.edition)) && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Class Features
            </Typography>

            {filledClasses.map((cls, i) => {
              const prog = getClassProgression(cls.classId, character.edition)
              if (!prog) return null
              const clsLevel = cls.level ?? character.totalLevel ?? 1
              const activeFeatures = (prog.features ?? []).filter(f => f.level <= clsLevel)
              if (activeFeatures.length === 0) return null

              return (
                <Box key={i} sx={{ mt: 1, mb: i < filledClasses.length - 1 ? 2 : 0 }}>
                  {isMulticlass && (
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {getClassName(cls.classId)} (Level {cls.level})
                    </Typography>
                  )}
                  <Grid container spacing={0.25}>
                    {activeFeatures.map((f, fi) => (
                      <Grid key={fi} size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2">
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ minWidth: 36, display: 'inline-block' }}>
                            Lv {f.level}
                          </Typography>
                          {' '}{f.name}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* SPELLS (full width)                                               */}
      {/* ================================================================ */}
      {(character.spells ?? []).length > 0 && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              Spells
            </Typography>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              {(character.spells ?? []).map(spellId => {
                const spell = spellCatalog.find(s => s.id === spellId)
                if (!spell) return <Chip key={spellId} label={spellId} size="small" variant="outlined" />
                const editionEntry = spell.editions.find(e => e.edition === character.edition)
                return <SpellHorizontalCard key={spellId} spell={spell} editionEntry={editionEntry} />
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* NARRATIVE (grid layout)                                           */}
      {/* ================================================================ */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            Narrative
          </Typography>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EditableTextField
                label="Personality Traits"
                value={narrative.personalityTraits.join(', ')}
                onSave={(v: string) =>
                  saveCharacter({
                    narrative: { ...narrative, personalityTraits: v.split(',').map((s: string) => s.trim()).filter(Boolean) },
                  })
                }
                disabled={!canEdit}
                multiline
                minRows={2}
                helperText="Comma-separated"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EditableTextField
                label="Ideals"
                value={narrative.ideals}
                onSave={(v: string) => saveCharacter({ narrative: { ...narrative, ideals: v } })}
                disabled={!canEdit}
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EditableTextField
                label="Bonds"
                value={narrative.bonds}
                onSave={(v: string) => saveCharacter({ narrative: { ...narrative, bonds: v } })}
                disabled={!canEdit}
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <EditableTextField
                label="Flaws"
                value={narrative.flaws}
                onSave={(v: string) => saveCharacter({ narrative: { ...narrative, flaws: v } })}
                disabled={!canEdit}
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <EditableTextField
                label="Backstory"
                value={narrative.backstory}
                onSave={(v: string) => saveCharacter({ narrative: { ...narrative, backstory: v } })}
                disabled={!canEdit}
                multiline
                minRows={3}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Delete character (owner only) */}
      {isOwner && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Divider sx={{ mb: 3 }} />
          <Button
            variant="text"
            color="error"
            onClick={() => setDeleteOpen(true)}
          >
            Delete Character
          </Button>
        </Box>
      )}

      {/* Award XP modal */}
      <AwardXpModal
        open={awardXpOpen}
        onClose={() => setAwardXpOpen(false)}
        characterName={character.name}
        currentXp={character.xp ?? 0}
        currentLevel={currentLevel}
        editionId={character.edition as EditionId}
        primaryClassId={primaryClassId}
        maxLevel={maxLevel}
        onAward={handleAwardXp}
      />

      {/* Level-up wizard */}
      {character.levelUpPending && character.pendingLevel && (
        <LevelUpWizard
          open={levelUpOpen}
          onClose={() => setLevelUpOpen(false)}
          character={character}
          onComplete={handleLevelUpComplete}
        />
      )}

      {/* Cancel level-up confirmation */}
      <ConfirmModal
        open={cancelLevelUpOpen}
        onCancel={() => setCancelLevelUpOpen(false)}
        onConfirm={handleCancelLevelUp}
        headline="Cancel Level-Up"
        description={`This will cancel the pending advancement to level ${character.pendingLevel} and revert ${character.name}'s XP to the level ${currentLevel} threshold. You can re-award XP afterward.`}
        confirmLabel="Cancel Level-Up"
        confirmColor="error"
      />

      {/* Delete character confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteCharacter}
        headline="Delete Character"
        description={
          activeCampaignCount > 0
            ? `This will remove ${character.name} from ${activeCampaignCount} active campaign${activeCampaignCount !== 1 ? 's' : ''} and notify party members. Campaign history will be preserved, but you will no longer be able to access this character.`
            : `This will permanently delete ${character.name}. This action cannot be undone.`
        }
        confirmLabel="Delete Character"
        confirmColor="error"
      />

      {/* Character status change confirmation */}
      <ConfirmModal
        open={!!statusAction}
        onCancel={() => setStatusAction(null)}
        onConfirm={handleCharacterStatusChange}
        headline={
          statusAction?.newStatus === 'deceased'
            ? 'Mark Character as Deceased'
            : isOwner && !isAdmin
              ? 'Leave Campaign'
              : 'Set Character Inactive'
        }
        description={
          statusAction?.newStatus === 'deceased'
            ? `This will mark ${character.name} as deceased in ${statusAction?.campaignName ?? 'the campaign'}. All party members will be notified.`
            : isOwner && !isAdmin
              ? `This will remove ${character.name} from ${statusAction?.campaignName ?? 'the campaign'}. All party members will be notified.`
              : `This will set ${character.name} as inactive in ${statusAction?.campaignName ?? 'the campaign'}. All party members will be notified.`
        }
        confirmLabel={
          statusAction?.newStatus === 'deceased'
            ? 'Mark Deceased'
            : isOwner && !isAdmin
              ? 'Leave Campaign'
              : 'Set Inactive'
        }
        confirmColor={statusAction?.newStatus === 'deceased' ? 'error' : 'warning'}
      />
    </Box>
  )
}
