import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

import { monsters, settings, editions, MONSTER_LABELS } from '@/data'
import type { Monster, EditionRule } from '@/data'
import { getNameById } from '@/domain/lookups'
import { resolveEditionRule } from '@/domain/monsters/monsters.conversions'
import { apiFetch } from '../../api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const L = MONSTER_LABELS

function editionName(id: string): string {
  return getNameById(editions as unknown as { id: string; name: string }[], id) ?? id
}

function formatMovement(m: EditionRule['mechanics']['movement']): string {
  const parts: string[] = []
  if (m.ground) parts.push(`${m.ground} ft.`)
  if (m.swim) parts.push(`Swim ${m.swim} ft.`)
  if (m.fly) parts.push(`Fly ${m.fly} ft.`)
  if (m.burrow) parts.push(`Burrow ${m.burrow} ft.`)
  return parts.join(', ') || '—'
}

function formatAttacks(attacks: EditionRule['mechanics']['attacks']): string {
  if (!attacks?.length) return '—'
  return attacks.map((a) => `${a.name} (${a.dice})`).join(', ')
}

function resolveSettingNames(settingIds: string[] | undefined): string {
  if (!settingIds?.length) return '—'
  return settingIds
    .map((id) => getNameById(settings as unknown as { id: string; name: string }[], id) ?? id)
    .join(', ')
}

// ---------------------------------------------------------------------------
// Stat row component
// ---------------------------------------------------------------------------

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '' || value === '—') return null
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 160, color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Edition rule detail renderer
// ---------------------------------------------------------------------------

function formatHitDice(editionRule: EditionRule): string {
  const m = editionRule.mechanics
  if (!('hitDice' in m)) return '—'                       // 4e has no hit dice
  const dieSize = 'hitDieSize' in m ? m.hitDieSize : 8  // 1e always d8
  let hd = `${(m as any).hitDice}d${dieSize}`
  if ('hitDiceAsterisks' in m && (m as any).hitDiceAsterisks) {
    hd += '*'.repeat((m as any).hitDiceAsterisks)
  }
  if ('hitDieModifier' in m && (m as any).hitDieModifier != null) {
    const mod = (m as any).hitDieModifier as number
    hd += mod > 0 ? `+${mod}` : String(mod)
  }
  return hd
}

function formatMorale(morale: unknown): string {
  if (typeof morale === 'number') return String(morale)
  if (morale && typeof morale === 'object' && 'category' in morale && 'value' in morale) {
    const m = morale as { category: string; value: number }
    return `${m.category} (${m.value})`
  }
  return '—'
}

function formatNumberAppearing(na: unknown): string {
  if (!na) return '—'
  if (typeof na === 'string') return na
  if (typeof na !== 'object') return '—'
  if ('wandering' in na && 'lair' in na) {
    const n = na as { wandering: string; lair: string }
    return `${n.wandering} (lair: ${n.lair})`
  }
  if ('min' in na && 'max' in na) {
    const n = na as { min: number; max: number }
    return `${n.min}–${n.max}`
  }
  return '—'
}

function EditionRuleDetail({ editionRule }: { editionRule: EditionRule }) {
  const hasHitDice = 'hitDice' in editionRule.mechanics
  const hasLevel = 'level' in editionRule.mechanics

  return (
    <>
      {/* Hit Dice / Level+Role & Source */}
      {hasLevel && (
        <>
          <StatRow label={L.level} value={(editionRule.mechanics as any).level} />
          <StatRow label={L.role} value={
            (editionRule.mechanics as any).roleModifier
              ? `${(editionRule.mechanics as any).roleModifier} ${(editionRule.mechanics as any).role}`
              : (editionRule.mechanics as any).role
          } />
          <StatRow label={L.hitPoints} value={(editionRule.mechanics as any).hitPoints} />
        </>
      )}
      {hasHitDice && <StatRow label={L.hitDice} value={formatHitDice(editionRule)} />}

      {editionRule.source?.book && (
        <StatRow label={L.source} value={editionRule.source.book} />
      )}

      <Divider sx={{ my: 3 }} />

      {/* Lore */}
      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        Lore
      </Typography>

      <StatRow label={L.alignment} value={editionRule.lore.alignment} />
      <StatRow label={L.xpValue} value={editionRule.lore.xpValue?.toLocaleString()} />
      <StatRow label={L.intelligence} value={editionRule.lore.intelligence} />
      {'frequency' in editionRule.lore && (
        <StatRow label={L.frequency} value={editionRule.lore.frequency} />
      )}
      {'organization' in editionRule.lore && (
        <StatRow label={L.organization} value={editionRule.lore.organization} />
      )}
      {'environment' in editionRule.lore && (
        <StatRow label={L.environment} value={(editionRule.lore as any).environment} />
      )}
      {'origin' in editionRule.lore && (
        <StatRow label={L.origin} value={(editionRule.lore as any).origin} />
      )}
      {'numberAppearing' in editionRule.lore && editionRule.lore.numberAppearing && (
        <StatRow label={L.numberAppearing} value={formatNumberAppearing(editionRule.lore.numberAppearing)} />
      )}
      {'percentInLair' in editionRule.lore && (
        <StatRow label={L.percentInLair} value={`${(editionRule.lore as any).percentInLair}%`} />
      )}
      {'treasureType' in editionRule.lore && (
        <StatRow label={L.treasureType} value={
          typeof editionRule.lore.treasureType === 'object'
            ? Object.entries(editionRule.lore.treasureType as Record<string, string>).map(([k, v]) => `${k}: ${v}`).join(', ')
            : editionRule.lore.treasureType
        } />
      )}
      {'challengeRating' in editionRule.lore && (
        <StatRow label={L.challengeRating} value={String(editionRule.lore.challengeRating)} />
      )}

      <Divider sx={{ my: 3 }} />

      {/* Mechanics */}
      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        Mechanics
      </Typography>

      <StatRow label={L.armorClass} value={editionRule.mechanics.armorClass} />
      {'fortitude' in editionRule.mechanics && (
        <StatRow label={L.fortitude} value={(editionRule.mechanics as any).fortitude} />
      )}
      {'reflex' in editionRule.mechanics && (
        <StatRow label={L.reflex} value={(editionRule.mechanics as any).reflex} />
      )}
      {'will' in editionRule.mechanics && (
        <StatRow label={L.will} value={(editionRule.mechanics as any).will} />
      )}
      {'initiative' in editionRule.mechanics && (
        <StatRow label={L.initiative} value={`+${(editionRule.mechanics as any).initiative}`} />
      )}
      <StatRow label={L.movement} value={formatMovement(editionRule.mechanics.movement)} />
      {'thac0' in editionRule.mechanics && (
        <StatRow label={L.thac0} value={(editionRule.mechanics as any).thac0} />
      )}
      {'attackBonus' in editionRule.mechanics && (
        <StatRow label={L.attackBonus} value={`+${(editionRule.mechanics as any).attackBonus}`} />
      )}
      {'baseAttackBonus' in editionRule.mechanics && (
        <StatRow label={L.baseAttackBonus} value={`+${(editionRule.mechanics as any).baseAttackBonus}`} />
      )}
      {'proficiencyBonus' in editionRule.mechanics && (editionRule.mechanics as any).proficiencyBonus && (
        <StatRow label={L.proficiencyBonus} value={`+${(editionRule.mechanics as any).proficiencyBonus}`} />
      )}
      <StatRow label={L.attacks} value={formatAttacks(editionRule.mechanics.attacks)} />
      {'specialAttacks' in editionRule.mechanics && (editionRule.mechanics as any).specialAttacks?.length > 0 && (
        <StatRow
          label={L.specialAttacks}
          value={(editionRule.mechanics as any).specialAttacks.join(', ')}
        />
      )}
      {editionRule.mechanics.specialDefenses && editionRule.mechanics.specialDefenses.length > 0 && (
        <StatRow
          label={L.specialDefenses}
          value={editionRule.mechanics.specialDefenses.join(', ')}
        />
      )}
      {'morale' in editionRule.mechanics && (editionRule.mechanics as any).morale != null && (
        <StatRow label={L.morale} value={formatMorale((editionRule.mechanics as any).morale)} />
      )}
      {'saveAs' in editionRule.mechanics && (editionRule.mechanics as any).saveAs && (
        <StatRow
          label={L.saveAs}
          value={`${(editionRule.mechanics as any).saveAs.class}: ${(editionRule.mechanics as any).saveAs.level}`}
        />
      )}
      {'abilities' in editionRule.mechanics && (editionRule.mechanics as any).abilities && (
        <StatRow
          label={L.abilities}
          value={Object.entries((editionRule.mechanics as any).abilities)
            .map(([k, v]) => `${k.toUpperCase()} ${v}`)
            .join(', ')}
        />
      )}
      {'traits' in editionRule.mechanics && (editionRule.mechanics as any).traits?.length > 0 && (
        <StatRow label={L.traits} value={(editionRule.mechanics as any).traits.join(', ')} />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Campaign data shape
// ---------------------------------------------------------------------------

type CampaignData = {
  identity?: { edition?: string }
  configuration?: { allowLegacyEditionNpcs?: boolean }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MonsterRoute() {
  const { id: campaignId, monsterId } = useParams<{ id: string; monsterId: string }>()

  const [campaign, setCampaign] = useState<CampaignData | undefined>()

  useEffect(() => {
    if (!campaignId) return
    apiFetch<{ campaign?: CampaignData }>(`/api/campaigns/${campaignId}`)
      .then((data) => setCampaign(data.campaign))
      .catch(() => {})
  }, [campaignId])

  const campaignEdition = campaign?.identity?.edition
  const allowLegacy = campaign?.configuration?.allowLegacyEditionNpcs ?? false

  const monster: Monster | undefined = monsters.find((m) => m.id === monsterId)

  if (!monster) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">Monster not found.</Alert>
      </Box>
    )
  }

  // Resolve: native match, converted match, or nothing
  const resolved = campaignEdition
    ? resolveEditionRule(monster, campaignEdition)
    : null

  const hasNativeRule = resolved && !resolved.converted
  const hasConvertedRule = resolved && resolved.converted && allowLegacy

  return (
    <Box sx={{ maxWidth: 720 }}>
      {/* Header */}
      <Typography variant="overline" color="text.secondary">
        Monster
      </Typography>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        {monster.name}
      </Typography>

      {/* Top-level info */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 160, color: 'text.secondary' }}>{L.type}</Typography>
          <Chip label={monster.type} size="small" />
        </Box>
        {monster.sizeCategory && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 160, color: 'text.secondary' }}>{L.sizeCategory}</Typography>
            <Chip label={monster.sizeCategory} size="small" variant="outlined" />
          </Box>
        )}
        {monster.vision && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 160, color: 'text.secondary' }}>{L.vision}</Typography>
            <Chip label={monster.vision} size="small" variant="outlined" />
          </Box>
        )}
      </Stack>

      <StatRow label={L.languages} value={monster.languages?.length ? monster.languages.join(', ') : 'None'} />
      <StatRow label={L.setting} value={resolveSettingNames(monster.setting)} />

      <Divider sx={{ my: 3 }} />

      {/* Edition-specific rules */}
      {!campaign ? (
        <Alert severity="info">Loading campaign edition...</Alert>
      ) : hasNativeRule ? (
        <EditionRuleDetail editionRule={resolved.rule} />
      ) : hasConvertedRule ? (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            You are viewing stats converted from {editionName(resolved.sourceEdition!)} to{' '}
            {editionName(campaignEdition!)}.
          </Alert>
          <EditionRuleDetail editionRule={resolved.rule} />
        </>
      ) : (
        <Alert severity="warning">
          This monster's rules are only available for{' '}
          {monster.editionRules.map((r) => editionName(r.edition)).join(', ')}
          . It is not compatible with your campaign's edition.
        </Alert>
      )}
    </Box>
  )
}
