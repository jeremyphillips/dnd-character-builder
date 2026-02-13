import type { Character } from "./character.core"

/** API/document shape for a character (extends CharacterSheet with stored fields). */
export type CharacterDoc = Character & {
  _id: string
  userId?: string
  imageUrl?: string | null

  ai?: Record<string, unknown>

  generation?: {
    model?: string
    promptVersion?: string
    messageId?: string
    createdAt?: string
  }

  createdAt: string
  updatedAt: string

  /** @deprecated Legacy field from pre-multiclass schema — use `classes[0].classId` instead. */
  class?: string
  /** @deprecated Legacy field from pre-multiclass schema — use `totalLevel` instead. */
  level?: number
}

