import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider'
import { useCampaignRules } from '@/app/providers/CampaignRulesProvider'
import { ROUTES } from '@/app/routes'
import { useCampaignParty } from '@/features/campaign/hooks'
import { useCharacter, useCharacters, useCombatStats } from '@/features/character/hooks'
import { toCharacterForEngine, type CharacterDetailDto } from '@/features/character/read-model'
import { calculateMonsterArmorClass } from '@/features/content/monsters/domain/mechanics/calculateMonsterArmorClass'
import type { Monster } from '@/features/content/monsters/domain/types'
import { formatHitPointsWithAverage, formatMovement } from '@/features/content/monsters/utils/formatters'
import type { DiceOrFlat } from '@/features/mechanics/domain/dice'
import type { Effect } from '@/features/mechanics/domain/effects/effects.types'
import type { CombatantAttackEntry } from '@/features/mechanics/domain/encounter'
import { AppAlert } from '@/ui/primitives'

type PartyOption = {
  id: string
  label: string
  subtitle: string
}

type EnemyOption = {
  key: string
  sourceId: string
  kind: 'npc' | 'monster'
  label: string
  subtitle: string
}

type EnemyRosterEntry = {
  runtimeId: string
  sourceKey: string
  sourceId: string
  kind: 'npc' | 'monster'
  label: string
}

function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : String(value)
}

function toAbilityModifier(score: number | null | undefined): number {
  return Math.floor(((score ?? 10) - 10) / 2)
}

function formatDice(value: DiceOrFlat | undefined): string | undefined {
  if (value == null) return undefined
  return String(value)
}

function formatEffectLabel(effect: Effect): string {
  switch (effect.kind) {
    case 'condition':
      return `Condition: ${effect.conditionId}`
    case 'custom':
      return effect.id
    case 'damage':
      return `Damage: ${formatDice(effect.damage) ?? '—'}`
    case 'grant':
      return effect.grantType === 'condition_immunity'
        ? `Immunity: ${effect.value}`
        : 'Proficiency grant'
    case 'modifier':
      return `Modifier: ${effect.target}`
    case 'resource':
      return `Resource: ${effect.resource.id}`
    case 'save':
      return `Save: ${effect.save.ability}`
    case 'state':
      return `State: ${effect.stateId}`
    case 'trigger':
      return `Trigger: ${effect.trigger}`
    default:
      return effect.kind.replaceAll('_', ' ')
  }
}

function formatCharacterSubtitle(character: CharacterDetailDto): string {
  const raceName = character.race?.name ?? 'Unknown race'
  const classes = character.classes.length > 0
    ? character.classes.map((cls) => `${cls.className} ${cls.level}`).join(' / ')
    : 'No class levels'

  return `${raceName} • ${classes}`
}

function formatPartyOptionSubtitle(option: {
  race: { name: string } | null
  classes: { className: string; level: number }[]
  ownerName?: string
}): string {
  const classLabel = option.classes.length > 0
    ? option.classes.map((cls) => `${cls.className} ${cls.level}`).join(' / ')
    : 'No class levels'
  const ownerLabel = option.ownerName ? ` • ${option.ownerName}` : ''
  return `${option.race?.name ?? 'Unknown race'} • ${classLabel}${ownerLabel}`
}

function formatNpcOptionSubtitle(option: {
  race?: string | null
  classes?: { className?: string; level: number }[]
}): string {
  const classLabel = option.classes && option.classes.length > 0
    ? option.classes.map((cls) => `${cls.className ?? 'Class'} ${cls.level}`).join(' / ')
    : 'No class levels'
  return `${option.race ?? 'Unknown race'} • ${classLabel}`
}

function formatMonsterOptionSubtitle(monster: Monster): string {
  const typeLabel = monster.type ?? 'monster'
  const sizeLabel = monster.sizeCategory ?? 'size unknown'
  const challengeRating = monster.lore?.challengeRating ?? '—'
  return `CR ${challengeRating} • ${sizeLabel} ${typeLabel}`
}

function buildMonsterAttackEntries(
  monster: Monster,
  weaponsById: Record<string, { name: string; damage?: { default?: DiceOrFlat }; damageType?: string }>,
): CombatantAttackEntry[] {
  const actions = monster.mechanics.actions ?? []

  return actions.map((action, index) => {
    if (action.kind === 'weapon') {
      const equippedWeapon = monster.mechanics.equipment?.weapons?.[action.weaponRef]
      const weaponId = equippedWeapon?.weaponId ?? action.weaponRef
      const weapon = weaponsById[weaponId]

      return {
        id: `${monster.id}-weapon-${action.weaponRef}-${index}`,
        name: equippedWeapon?.aliasName ?? weapon?.name ?? action.weaponRef,
        attackBonus: equippedWeapon?.attackBonus,
        damage: formatDice(equippedWeapon?.damageOverride ?? weapon?.damage?.default),
        damageType: weapon?.damageType,
        notes: equippedWeapon?.notes,
      }
    }

    if (action.kind === 'natural') {
      return {
        id: `${monster.id}-natural-${index}`,
        name: action.name ?? action.attackType,
        attackBonus: action.attackBonus,
        damage: formatDice(action.damage),
        damageType: action.damageType,
        notes: action.notes,
      }
    }

    return {
      id: `${monster.id}-special-${index}`,
      name: action.name,
      attackBonus: action.attackBonus,
      damage: formatDice(action.damage),
      damageType: action.damageType,
      notes: [action.description, action.notes].filter(Boolean).join(' '),
    }
  })
}

function buildMonsterEffectLabels(monster: Monster): string[] {
  return (monster.mechanics.traits ?? []).flatMap((trait) =>
    (trait.effects ?? []).map((effect) => `${trait.name}: ${formatEffectLabel(effect)}`),
  )
}

function StatChips({
  items,
}: {
  items: { label: string; value: string | number }[]
}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {items.map((item) => (
        <Chip
          key={item.label}
          label={`${item.label}: ${item.value}`}
          size="small"
          variant="outlined"
        />
      ))}
    </Stack>
  )
}

function AttackList({
  attacks,
}: {
  attacks: CombatantAttackEntry[]
}) {
  if (attacks.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No attack entries loaded yet.
      </Typography>
    )
  }

  return (
    <Stack spacing={1}>
      {attacks.map((attack) => (
        <Box
          key={attack.id}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.25,
            bgcolor: 'background.default',
          }}
        >
          <Stack direction="row" justifyContent="space-between" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography variant="body2" fontWeight={600}>
              {attack.name}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {typeof attack.attackBonus === 'number' && (
                <Chip label={`To hit ${formatSigned(attack.attackBonus)}`} size="small" />
              )}
              {attack.damage && (
                <Chip
                  label={
                    attack.damageType
                      ? `${attack.damage} ${attack.damageType}`
                      : attack.damage
                  }
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>
          {attack.notes && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
              {attack.notes}
            </Typography>
          )}
        </Box>
      ))}
    </Stack>
  )
}

function EffectList({
  labels,
}: {
  labels: string[]
}) {
  if (labels.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No active effects surfaced yet.
      </Typography>
    )
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {labels.map((label, index) => (
        <Chip key={`${label}-${index}`} label={label} size="small" variant="outlined" />
      ))}
    </Stack>
  )
}

function CharacterCombatantCard({
  characterId,
  sourceKind,
  onRemove,
}: {
  characterId: string
  sourceKind: 'pc' | 'npc'
  onRemove: () => void
}) {
  const { character, loading, error } = useCharacter(characterId)

  if (loading) {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <CircularProgress size={18} />
          <Typography variant="body2" color="text.secondary">
            Loading {sourceKind === 'pc' ? 'party member' : 'NPC'}…
          </Typography>
        </Stack>
      </Paper>
    )
  }

  if (!character) {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography variant="body2" color="error">
            {error ?? 'Character could not be loaded.'}
          </Typography>
          <Button size="small" color="inherit" onClick={onRemove} startIcon={<DeleteOutlineIcon />}>
            Remove
          </Button>
        </Stack>
      </Paper>
    )
  }

  return <LoadedCharacterCombatantCard character={character} sourceKind={sourceKind} onRemove={onRemove} />
}

function LoadedCharacterCombatantCard({
  character,
  sourceKind,
  onRemove,
}: {
  character: CharacterDetailDto
  sourceKind: 'pc' | 'npc'
  onRemove: () => void
}) {
  const engineCharacter = useMemo(() => toCharacterForEngine(character), [character])
  const combatStats = useCombatStats(engineCharacter)
  const effectLabels = useMemo(
    () => combatStats.activeEffects.map((effect) => effect.text ?? formatEffectLabel(effect)),
    [combatStats.activeEffects],
  )
  const attacks = useMemo<CombatantAttackEntry[]>(
    () =>
      combatStats.attacks.map((attack) => ({
        id: `${character.id}-${attack.weaponId}-${attack.hand}`,
        name: attack.name,
        attackBonus: attack.attackBonus,
        damage: attack.damage,
        damageType: attack.damageType,
      })),
    [character.id, combatStats.attacks],
  )

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h6">{character.name}</Typography>
              <Chip label={sourceKind === 'pc' ? 'Party' : 'NPC'} size="small" color="primary" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {formatCharacterSubtitle(character)}
            </Typography>
          </Box>
          <Button size="small" color="inherit" onClick={onRemove} startIcon={<DeleteOutlineIcon />}>
            Remove
          </Button>
        </Stack>

        <StatChips
          items={[
            { label: 'AC', value: combatStats.armorClass },
            { label: 'HP', value: `${character.hitPoints.total} / ${combatStats.maxHp}` },
            { label: 'Init', value: formatSigned(combatStats.initiative) },
          ]}
        />

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Attacks
          </Typography>
          <AttackList attacks={attacks} />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Active Effects
          </Typography>
          <EffectList labels={effectLabels} />
        </Box>
      </Stack>
    </Paper>
  )
}

function MonsterCombatantCard({
  monster,
  runtimeId,
  onAddCopy,
  onRemove,
}: {
  monster: Monster
  runtimeId: string
  onAddCopy: () => void
  onRemove: () => void
}) {
  const { catalog } = useCampaignRules()
  const dexterityScore = monster.mechanics.abilities?.dexterity
  const initiativeModifier = toAbilityModifier(dexterityScore)
  const armorClass = calculateMonsterArmorClass(monster, catalog.armorById).value
  const averageHitPoints =
    Math.floor(monster.mechanics.hitPoints.count * ((monster.mechanics.hitPoints.die + 1) / 2)) +
    (monster.mechanics.hitPoints.modifier ?? 0)

  const attacks = useMemo(
    () => buildMonsterAttackEntries(monster, catalog.weaponsById),
    [monster, catalog.weaponsById],
  )
  const effectLabels = useMemo(() => buildMonsterEffectLabels(monster), [monster])

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h6">{monster.name}</Typography>
              <Chip label="Monster" size="small" color="error" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {formatMonsterOptionSubtitle(monster)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Runtime ID: {runtimeId}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={onAddCopy} startIcon={<AddIcon />}>
              Add Copy
            </Button>
            <Button size="small" color="inherit" onClick={onRemove} startIcon={<DeleteOutlineIcon />}>
              Remove
            </Button>
          </Stack>
        </Stack>

        <StatChips
          items={[
            { label: 'AC', value: armorClass },
            { label: 'HP', value: `${averageHitPoints} avg` },
            { label: 'Init', value: formatSigned(initiativeModifier) },
            { label: 'Speed', value: formatMovement(monster.mechanics.movement) },
          ]}
        />

        <Typography variant="body2" color="text.secondary">
          {formatHitPointsWithAverage(monster.mechanics.hitPoints)}
        </Typography>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Attacks
          </Typography>
          <AttackList attacks={attacks} />
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Active Effects
          </Typography>
          <EffectList labels={effectLabels} />
        </Box>
      </Stack>
    </Paper>
  )
}

function CombatLane({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Paper sx={{ p: 3, minHeight: 320 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        {children}
      </Stack>
    </Paper>
  )
}

export default function CombatTestRoute() {
  const { campaignId, campaignName } = useActiveCampaign()
  const { catalog } = useCampaignRules()
  const { party, loading: loadingParty } = useCampaignParty('approved')
  const { characters: npcs, loading: loadingNpcs } = useCharacters({ type: 'npc' })

  const runtimeIdCounter = useRef(0)
  const nextRuntimeId = (prefix: string) => {
    runtimeIdCounter.current += 1
    return `${prefix}-${runtimeIdCounter.current}`
  }

  const partyOptions = useMemo<PartyOption[]>(
    () =>
      party.map((member) => ({
        id: member.id,
        label: member.name,
        subtitle: formatPartyOptionSubtitle(member),
      })),
    [party],
  )
  const monsterOptions = useMemo<EnemyOption[]>(
    () =>
      Object.values(catalog.monstersById)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((monster) => ({
          key: `monster:${monster.id}`,
          sourceId: monster.id,
          kind: 'monster' as const,
          label: monster.name,
          subtitle: formatMonsterOptionSubtitle(monster),
        })),
    [catalog.monstersById],
  )
  const npcOptions = useMemo<EnemyOption[]>(
    () =>
      npcs
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((npc) => ({
          key: `npc:${npc._id}`,
          sourceId: npc._id,
          kind: 'npc' as const,
          label: npc.name,
          subtitle: formatNpcOptionSubtitle({
            race: typeof npc.race === 'string' ? npc.race : null,
            classes: npc.classes?.map((cls) => ({
              className: cls.classId,
              level: cls.level,
            })),
          }),
        })),
    [npcs],
  )
  const enemyOptions = useMemo(
    () => [...npcOptions, ...monsterOptions].sort((a, b) => a.label.localeCompare(b.label)),
    [npcOptions, monsterOptions],
  )
  const enemyOptionsByKey = useMemo(
    () => Object.fromEntries(enemyOptions.map((option) => [option.key, option])),
    [enemyOptions],
  )
  const monstersById = catalog.monstersById

  const [selectedPartyIds, setSelectedPartyIds] = useState<string[]>([])
  const [enemyRoster, setEnemyRoster] = useState<EnemyRosterEntry[]>([])

  const selectedPartyOptions = useMemo(
    () => partyOptions.filter((option) => selectedPartyIds.includes(option.id)),
    [partyOptions, selectedPartyIds],
  )
  const selectedEnemyOptions = useMemo(() => {
    const uniqueKeys = Array.from(new Set(enemyRoster.map((entry) => entry.sourceKey)))
    return uniqueKeys
      .map((key) => enemyOptionsByKey[key])
      .filter((option): option is EnemyOption => Boolean(option))
  }, [enemyRoster, enemyOptionsByKey])

  const enemySourceCounts = useMemo(
    () =>
      enemyRoster.reduce<Record<string, number>>((counts, entry) => {
        counts[entry.sourceKey] = (counts[entry.sourceKey] ?? 0) + 1
        return counts
      }, {}),
    [enemyRoster],
  )

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Box>
          <Typography variant="h4">Combat Test</Typography>
          <Typography variant="body1" color="text.secondary">
            {campaignName ? `${campaignName} encounter sandbox` : 'Encounter sandbox'}
          </Typography>
        </Box>
        <Button
          component={Link}
          to={campaignId ? ROUTES.CAMPAIGN.replace(':id', campaignId) : ROUTES.CAMPAIGNS}
          startIcon={<ArrowBackIcon />}
          size="small"
        >
          Campaign
        </Button>
      </Stack>

      <AppAlert tone="info">
        This slice loads approved party members, campaign NPCs, and monsters into the sandbox and renders combat-ready cards. Initiative controls, encounter start, and live log emission land next.
      </AppAlert>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}
      >
        <CombatLane
          title="Party"
          description="Choose approved party members to append PC combatant cards with initiative, AC, HP, attacks, and surfaced active effects."
        >
          <Autocomplete<PartyOption, true, false, false>
            multiple
            options={partyOptions}
            value={selectedPartyOptions}
            loading={loadingParty}
            onChange={(_, nextValue) => setSelectedPartyIds(nextValue.map((option) => option.id))}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.label}
            noOptionsText="No approved party members found."
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack spacing={0.25}>
                  <Typography variant="body2">{option.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.subtitle}
                  </Typography>
                </Stack>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Approved Party Members"
                placeholder="Search party members"
              />
            )}
          />

          <Stack spacing={2}>
            {selectedPartyIds.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No party combatants selected yet.
              </Typography>
            ) : (
              selectedPartyIds.map((characterId) => (
                <CharacterCombatantCard
                  key={characterId}
                  characterId={characterId}
                  sourceKind="pc"
                  onRemove={() =>
                    setSelectedPartyIds((prev) => prev.filter((id) => id !== characterId))
                  }
                />
              ))
            )}
          </Stack>
        </CombatLane>

        <CombatLane
          title="Enemies"
          description="Choose NPC or monster sources. Removing a source from the multiselect clears every copy, while selected monster cards can add duplicate runtime instances."
        >
          <Autocomplete<EnemyOption, true, false, false>
            multiple
            options={enemyOptions}
            value={selectedEnemyOptions}
            loading={loadingNpcs}
            onChange={(_, nextValue) => {
              const nextKeys = new Set(nextValue.map((option) => option.key))
              const previousKeys = new Set(enemyRoster.map((entry) => entry.sourceKey))

              setEnemyRoster([
                ...enemyRoster.filter((entry) => nextKeys.has(entry.sourceKey)),
                ...nextValue
                  .filter((option) => !previousKeys.has(option.key))
                  .map((option) => ({
                    runtimeId: nextRuntimeId(option.kind),
                    sourceKey: option.key,
                    sourceId: option.sourceId,
                    kind: option.kind,
                    label: option.label,
                  })),
              ])
            }}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            getOptionLabel={(option) => option.label}
            noOptionsText="No NPC or monster options found."
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Stack spacing={0.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">{option.label}</Typography>
                    <Chip label={option.kind === 'npc' ? 'NPC' : 'Monster'} size="small" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {option.subtitle}
                  </Typography>
                </Stack>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Enemy Sources"
                placeholder="Search NPCs and monsters"
              />
            )}
          />

          <Stack spacing={2}>
            {enemyRoster.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No enemy combatants selected yet.
              </Typography>
            ) : (
              enemyRoster.map((entry) => {
                if (entry.kind === 'npc') {
                  return (
                    <CharacterCombatantCard
                      key={entry.runtimeId}
                      characterId={entry.sourceId}
                      sourceKind="npc"
                      onRemove={() =>
                        setEnemyRoster((prev) =>
                          prev.filter((candidate) => candidate.runtimeId !== entry.runtimeId),
                        )
                      }
                    />
                  )
                }

                const monster = monstersById[entry.sourceId]
                if (!monster) {
                  return (
                    <Paper key={entry.runtimeId} sx={{ p: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="error">
                          Monster `{entry.sourceId}` could not be resolved.
                        </Typography>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() =>
                            setEnemyRoster((prev) =>
                              prev.filter((candidate) => candidate.runtimeId !== entry.runtimeId),
                            )
                          }
                          startIcon={<DeleteOutlineIcon />}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Paper>
                  )
                }

                return (
                  <MonsterCombatantCard
                    key={entry.runtimeId}
                    monster={monster}
                    runtimeId={entry.runtimeId}
                    onAddCopy={() =>
                      setEnemyRoster((prev) => [
                        ...prev,
                        {
                          runtimeId: nextRuntimeId('monster'),
                          sourceKey: entry.sourceKey,
                          sourceId: entry.sourceId,
                          kind: 'monster',
                          label: entry.label,
                        },
                      ])
                    }
                    onRemove={() =>
                      setEnemyRoster((prev) =>
                        prev.filter((candidate) => candidate.runtimeId !== entry.runtimeId),
                      )
                    }
                  />
                )
              })
            )}
          </Stack>

          {selectedEnemyOptions.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedEnemyOptions.map((option) => (
                <Chip
                  key={option.key}
                  label={`${option.label} × ${enemySourceCounts[option.key] ?? 0}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          )}
        </CombatLane>
      </Box>

      <Paper sx={{ p: 3, minHeight: 220 }}>
        <Stack spacing={1.5}>
          <Typography variant="h5">Combat Log</Typography>
          <Typography variant="body2" color="text.secondary">
            Structured encounter events will render here once the local encounter state and turn rules are connected.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current setup: {selectedPartyIds.length} party combatant{selectedPartyIds.length === 1 ? '' : 's'} and {enemyRoster.length} enemy combatant{enemyRoster.length === 1 ? '' : 's'}.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  )
}
