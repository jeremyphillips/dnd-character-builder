/**
 * Shared form types for Spell Create/Edit forms.
 * Extends Spell domain shape for form representation (string for numberText, etc.).
 */
import type { MagicSchool } from '@/features/content/domain/vocab';
import type { ClassId } from '@/shared/types/ruleset';

export type SpellFormValues = {
  name: string;
  school: MagicSchool | '';
  level: string;
  classes: ClassId[];
  ritual: boolean;
  concentration: boolean;
  effects: string;
};
