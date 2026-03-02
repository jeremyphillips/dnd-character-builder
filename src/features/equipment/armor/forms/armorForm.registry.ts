/**
 * Armor form field registry — single source of truth for config + mapping.
 */
import { DEFAULT_VISIBILITY_PUBLIC } from '@/ui/patterns';
import type { Armor, ArmorInput } from '@/features/content/domain/types';
import {
  ARMOR_CATEGORY_OPTIONS,
  ARMOR_MATERIAL_OPTIONS,
} from '@/features/content/domain/vocab';
import type { FieldSpec } from '@/features/equipment/forms/registry';
import type { ArmorFormValues } from './armorForm.types';

const trim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const trimOrNull = (v: unknown): string | null =>
  trim(v) ? trim(v) : null;
const numOrUndefined = (v: unknown): number | undefined => {
  if (v === '' || v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const strOrEmpty = (v: unknown): string =>
  v != null ? String(v) : '';
const numToStr = (v: unknown): string =>
  v != null && Number.isFinite(Number(v)) ? String(v) : '';

export const ARMOR_FORM_FIELDS: FieldSpec<
  ArmorFormValues,
  ArmorInput,
  Armor
>[] = [
  {
    name: 'name',
    label: 'Name',
    kind: 'text',
    required: true,
    placeholder: 'Item name',
    defaultValue: '',
    parse: (v) => trim(v) || undefined,
    format: (v) => strOrEmpty(v),
  },
  {
    name: 'description',
    label: 'Description',
    kind: 'textarea',
    placeholder: 'Describe the item...',
    defaultValue: '',
    parse: (v) => trim(v) || undefined,
    format: (v) => strOrEmpty(v),
  },
  {
    name: 'imageKey',
    label: 'Image',
    kind: 'imageUpload',
    helperText: '/assets/... or CDN key',
    defaultValue: '',
    parse: (v) => trimOrNull(v),
    format: (v) => strOrEmpty(v),
  },
  {
    name: 'accessPolicy',
    label: 'Visibility',
    kind: 'visibility',
    skipInForm: true,
    defaultValue: DEFAULT_VISIBILITY_PUBLIC,
    parse: (v) => v,
    format: (v) => (v ?? DEFAULT_VISIBILITY_PUBLIC) as ArmorFormValues['accessPolicy'],
  },
  {
    name: 'category',
    label: 'Category',
    kind: 'select',
    options: ARMOR_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    placeholder: 'Select category',
    defaultFromOptions: 'first',
    parse: (v) => (v ? (v as ArmorInput['category']) : undefined),
    format: (v) => (v ?? '') as ArmorFormValues['category'],
  },
  {
    name: 'material',
    label: 'Material',
    kind: 'select',
    options: ARMOR_MATERIAL_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    placeholder: 'Select material',
    defaultFromOptions: 'first',
    parse: (v) => (v ? (v as ArmorInput['material']) : undefined),
    format: (v) => (v ?? '') as ArmorFormValues['material'],
  },
  {
    name: 'baseAC',
    label: 'Base AC',
    kind: 'numberText',
    placeholder: 'e.g. 14',
    defaultValue: '',
    parse: (v) => numOrUndefined(v),
    format: (v) => numToStr(v),
  },
  {
    name: 'acBonus',
    label: 'AC Bonus',
    kind: 'numberText',
    placeholder: 'e.g. 2',
    defaultValue: '',
    parse: (v) => numOrUndefined(v),
    format: (v) => numToStr(v),
    formatForDisplay: (v) =>
      v != null && Number.isFinite(Number(v)) ? `+${v}` : '',
  },
  {
    name: 'stealthDisadvantage',
    label: 'Stealth Disadvantage',
    kind: 'checkbox',
    defaultValue: false,
    parse: (v) => Boolean(v),
    format: (v) => Boolean(v ?? false),
    formatForDisplay: (v) => (v ? 'Yes' : 'No'),
  },
];
