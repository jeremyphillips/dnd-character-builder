import { editions } from '@/data/editions'
import { equipment } from '@/data/equipment'
import { resolveEquipmentEdition } from '@/features/equipment/domain'
import type { EditionId } from '@/data'
import type { MagicItem, MagicItemRarity } from '@/data/equipment/magicItems.types'

// ─── Rarity ordering (weakest → strongest) ──────────────────────────────────
const RARITY_ORDER: MagicItemRarity[] = [
  'common',
  'uncommon',
  'rare',
  'very-rare',
  'legendary',
  'artifact'
]

const rarityIndex = (r: MagicItemRarity): number => RARITY_ORDER.indexOf(r)

// ─── Budget helpers ──────────────────────────────────────────────────────────

export interface MagicItemBudget {
  /** Maximum rarity allowed at this level (5e).  Undefined if the edition
   *  doesn't use rarity gating (4e, 3e). */
  maxRarity?: MagicItemRarity
  /** How many permanent items the character should have by now */
  permanentSlots: number
  /** How many consumables (potions, scrolls) */
  consumableSlots: number
  /** Max attunement slots — 5e: 3, others: undefined (no attunement system) */
  maxAttunement?: number
  /** 3e/3.5e: max GP value of a single item at this tier */
  maxItemValueGp?: number
}

/**
 * Look up the magic item budget for a given edition and character level.
 *
 * Returns `null` if the edition has no structured magic-item system (1e, 2e,
 * Basic, OD&D).
 */
export const getMagicItemBudget = (
  editionId: EditionId | undefined,
  level: number
): MagicItemBudget | null => {
  if (!editionId) return null

  const edition = editions.find(e => e.id === editionId)
  if (!edition?.magicItemBudget) return null

  const { tiers, maxAttunement } = edition.magicItemBudget
  const tier = tiers.find(
    t => level >= t.levelRange[0] && level <= t.levelRange[1]
  )
  if (!tier) return null

  return {
    maxRarity: tier.maxRarity,
    permanentSlots: tier.permanentItems,
    consumableSlots: tier.consumableItems,
    maxAttunement,
    maxItemValueGp: tier.maxItemValueGp
  }
}

/**
 * Return the set of rarities available at a given level in a given edition.
 *
 * For 5e this is all rarities up to and including the tier's `maxRarity`.
 * For editions without rarity gating, returns all rarities (filtering is
 * handled elsewhere via item level or GP value).
 */
export const getMagicItemRaritiesForLevel = (
  editionId: EditionId | undefined,
  level: number
): MagicItemRarity[] => {
  const budget = getMagicItemBudget(editionId, level)
  if (!budget?.maxRarity) return [...RARITY_ORDER]

  const maxIdx = rarityIndex(budget.maxRarity)
  return RARITY_ORDER.filter((_, i) => i <= maxIdx)
}

// ─── Item filtering ──────────────────────────────────────────────────────────

/**
 * Return magic items available for a character at a given edition + level.
 *
 * Filtering strategy differs by edition:
 *   - **5e**: Filter by rarity (must be ≤ tier's maxRarity)
 *   - **4e**: Filter by `enhancementLevel` (must be ≤ character level)
 *   - **3e / 3.5e**: Filter by GP cost (must be ≤ tier's maxItemValueGp)
 *   - **Other editions**: Return all items that have edition data
 *
 * Items that lack an `editionData` entry for the resolved edition are excluded.
 */
export const getAvailableMagicItems = (
  editionId: EditionId | undefined,
  level: number
): MagicItem[] => {
  if (!editionId) return []

  const effectiveEdition = resolveEquipmentEdition(editionId)
  const budget = getMagicItemBudget(editionId, level)

  return equipment.magicItems.filter((item: MagicItem) => {
    // Must have data for this edition
    const datum = item.editionData.find(d => d.edition === effectiveEdition)
    if (!datum) return false

    // ── 5e rarity gate ──
    if (budget?.maxRarity && datum.rarity) {
      if (rarityIndex(datum.rarity) > rarityIndex(budget.maxRarity)) {
        return false
      }
    }

    // ── 4e item-level gate ──
    if (editionId === '4e' && datum.enhancementLevel != null) {
      if (datum.enhancementLevel > level) return false
    }

    // ── 3e / 3.5e GP value gate ──
    if (
      (editionId === '3e' || editionId === '3.5e') &&
      budget?.maxItemValueGp != null
    ) {
      const costGp = parseCostToGp(datum.cost)
      if (costGp > budget.maxItemValueGp) return false
    }

    return true
  })
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Very simple cost parser — handles strings like "2,000 gp", "750 gp", "—".
 * Returns 0 for non-numeric costs.
 */
function parseCostToGp(cost: string): number {
  if (!cost || cost === '—') return 0
  const cleaned = cost.replace(/,/g, '').replace(/\s*gp$/i, '').trim()
  const num = Number(cleaned)
  return Number.isNaN(num) ? 0 : num
}
