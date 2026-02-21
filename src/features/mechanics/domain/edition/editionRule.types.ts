export type EditionRule = 
| EditionRule1e 
| EditionRule2e 
| EditionRule5e 
| EditionRuleBecmi 
| EditionRuleBx 
| EditionRuleHolmes 
| EditionRuleOdd 
| EditionRule3e 
| EditionRule35e 
| EditionRule4e

// ---------------------------------------------------------------------------
// Edition rules (discriminated union)
// ---------------------------------------------------------------------------

export interface EditionRuleBase {
  source?: { book: string; page?: number }
}
