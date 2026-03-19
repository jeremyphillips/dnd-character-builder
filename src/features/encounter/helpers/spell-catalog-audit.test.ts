import { describe, expect, it } from 'vitest'
import { getSystemSpells } from '@/features/mechanics/domain/rulesets/system/spells'
import { DEFAULT_SYSTEM_RULESET_ID } from '@/features/mechanics/domain/rulesets/ids/systemIds'
import { buildSpellAuditRow, summarizeSpellAudit } from './spell-resolution-audit'

/**
 * Lightweight catalog audit — run with: `pnpm vitest run spell-catalog-audit`
 * Stranded counts are reporting metrics only (not CI gates).
 */
describe('system spell catalog audit', () => {
  it('summarizes stranded and ambiguous-delivery metrics for the default ruleset', () => {
    const spells = getSystemSpells(DEFAULT_SYSTEM_RULESET_ID)
    const summary = summarizeSpellAudit(spells)

    expect(summary.total).toBeGreaterThan(0)
    expect(summary.stranded).toBeGreaterThanOrEqual(0)
    expect(summary.strandedFullSupport).toBeGreaterThanOrEqual(0)
    expect(summary.ambiguousDelivery).toBeGreaterThanOrEqual(0)

    // eslint-disable-next-line no-console -- intentional audit output
    console.log('[spell-catalog-audit]', summary)
  })

  it('every catalog spell produces a valid audit row', () => {
    const spells = getSystemSpells(DEFAULT_SYSTEM_RULESET_ID)
    for (const spell of spells) {
      const row = buildSpellAuditRow(spell)
      expect(row.id).toBe(spell.id)
      expect(['none', 'partial', 'full']).toContain(row.mechanicalSupportLevel)
      expect(['attack-roll', 'effects', 'log-only']).toContain(row.adapterMode)
      expect(row.stranded).toBe(row.mechanicalSupportLevel !== 'none' && row.adapterMode === 'log-only')
    }
  })
})
