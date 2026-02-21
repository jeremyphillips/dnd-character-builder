import type { SettingId } from '../types'
import type { EditionRule } from '@/features/mechanics/domain/edition/editionRule.types'

// ---------------------------------------------------------------------------
// Monster (top-level)
// ---------------------------------------------------------------------------

export interface Monster {
  id: string
  name: string
  description?: {
    short?: string
    long?: string
  }
  type: string
  subtype?: string
  sizeCategory?: string
  languages?: string[]
  vision?: string
  diet?: string[]
  setting?: SettingId[]
  editionRules: EditionRule[]
}
