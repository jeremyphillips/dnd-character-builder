import type { WeaponDamageType } from '@/features/content/equipment/weapons/domain/vocab'

/**
 * Canonical damage types for mechanics: weapon physical types plus common energy / special types.
 * Used by monsters, traits, spells, and encounter resolution — not monster-specific.
 */
export type DamageType =
  | WeaponDamageType
  | 'fire'
  | 'acid'
  | 'cold'
  | 'lightning'
  | 'thunder'
  | 'radiant'
  | 'necrotic'
  | 'poison'
