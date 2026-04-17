/**
 * Race form field registry — single source of truth for config + mapping.
 * Name, description, and visibility only until race `imageKey` persistence lands (Phase 2).
 */
import type { Race, RaceInput } from '@/features/content/races/domain/types';
import { getNameDescriptionFieldSpecs } from '@/features/content/shared/forms/baseFieldSpecs';
import type { FieldSpec } from '@/features/content/shared/forms/registry';
import { DEFAULT_VISIBILITY_PUBLIC } from '@/ui/patterns';
import type { RaceFormValues } from '../types/raceForm.types';

export const RACE_FORM_FIELDS = [
  ...getNameDescriptionFieldSpecs<
    RaceFormValues,
    RaceInput & Record<string, unknown>,
    Race & Record<string, unknown>
  >(),
  {
    name: 'accessPolicy' as keyof RaceFormValues & string,
    label: 'Visibility',
    kind: 'visibility',
    skipInForm: true,
    defaultValue: DEFAULT_VISIBILITY_PUBLIC as RaceFormValues['accessPolicy'],
    parse: (v) => (v ?? DEFAULT_VISIBILITY_PUBLIC) as RaceInput['accessPolicy'],
    format: (v) => (v ?? DEFAULT_VISIBILITY_PUBLIC) as RaceFormValues['accessPolicy'],
  },
] as const satisfies readonly FieldSpec<
  RaceFormValues,
  RaceInput & Record<string, unknown>,
  Race & Record<string, unknown>
>[];
