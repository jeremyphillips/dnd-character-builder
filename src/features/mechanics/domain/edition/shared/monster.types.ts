import type { AlignmentId } from "@/features/content/domain/types"

// ---------------------------------------------------------------------------
// Edition-specific lore
// ---------------------------------------------------------------------------

export interface LoreBase {
  alignment: AlignmentId
  xpValue: number
}