/**
 * Shared form types for Spell Create/Edit forms.
 * Extends Spell domain shape for form representation (string for numberText, etc.).
 */
import type { ContentFormValues } from '@/features/content/domain/types';
import type { MagicSchool } from '@/features/content/domain/vocab';
import type { ClassId } from '@/shared/types/ruleset';

export type SpellFormValues = ContentFormValues & {
  school: MagicSchool | '';
  level: string;
  classes: ClassId[];
  ritual: boolean;
  concentration: boolean;
  effects: string;
};
