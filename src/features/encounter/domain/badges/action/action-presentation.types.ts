import type { ActionBadgeDescriptor } from './combat-action-badges.types'

/**
 * Semantic purpose-category for an action.
 * Distinct from CombatActionKind (which is source-based: weapon-attack, monster-action, spell, combat-effect).
 * Used for grouping, filtering, and display in action lists.
 */
export type ActionSemanticCategory =
  | 'attack'
  | 'spell'
  | 'utility'
  | 'heal'
  | 'buff'
  | 'item'

export type ActionFooterLink = {
  /** Route-template path with :id placeholder for campaignId still present when spellId-based. */
  spellId?: string
  label: string
}

/**
 * Presentation view model for a combat action.
 * Pure data — no React, no hooks. Consumers apply context (e.g. campaignId for footer links)
 * and render secondLine/name as appropriate for their layout.
 */
export type ActionPresentationViewModel = {
  actionId: string
  displayName: string
  secondLine?: string
  badges: ActionBadgeDescriptor[]
  category: ActionSemanticCategory
  footerLink?: ActionFooterLink
}
