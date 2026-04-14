/**
 * Spell form field registry — simple FieldSpecs + composite UI fields (no parse; assembly handles nested domain).
 */
import type { CharacterClass } from '@/features/content/classes/domain/types';
import type { Spell, SpellInput, SpellLevel } from '@/features/content/spells/domain/types';
import { SPELL_LEVELS } from '@/features/content/spells/domain/types/spell.types';
import { DEFAULT_VISIBILITY_PUBLIC } from '@/ui/patterns';
import { when } from '@/ui/patterns';
import { type FieldSpec } from '@/features/content/shared/forms/registry';
import { getSpellcastingClasses } from '@/features/mechanics/domain/classes';
import { getSystemClasses } from '@/features/mechanics/domain/rulesets/system/classes';
import { DEFAULT_SYSTEM_RULESET_ID } from '@/features/mechanics/domain/rulesets/ids/systemIds';
import type { SpellFormValues } from '../types/spellForm.types';
import { formatSpellLevelShort, SPELL_CORE_UI } from '../../spellPresentation';
import {
  SPELL_CASTING_TIME_UNIT_OPTIONS,
  SPELL_COMPONENT_CHECKBOX_OPTIONS,
  SPELL_DURATION_KIND_SELECT_OPTIONS,
  SPELL_MATERIAL_COIN_OPTIONS,
  SPELL_RANGE_KIND_SELECT_OPTIONS,
  SPELL_SCHOOL_SELECT_OPTIONS,
  SPELL_DISTANCE_UNIT_OPTIONS,
  SPELL_TIME_UNIT_OPTIONS,
  SPELL_TRIGGER_SELECT_OPTIONS,
} from '../options/spellForm.options';

const SPELL_LEVEL_SELECT_OPTIONS = SPELL_LEVELS.map((lvl) => ({
  value: String(lvl),
  label: formatSpellLevelShort(lvl),
}));

export type SpellFormFieldsOptions = {
  classesById?: Record<string, CharacterClass> | undefined;
};

export function buildSpellClassCheckboxOptions(
  classesById: Record<string, CharacterClass> | undefined,
): { options: { value: string; label: string }[]; allowedById: Record<string, unknown> } {
  if (classesById == null) {
    const spellcasting = getSpellcastingClasses([...getSystemClasses(DEFAULT_SYSTEM_RULESET_ID)]);
    const options = spellcasting.map((c) => ({ value: c.id, label: c.name }));
    return {
      options,
      allowedById: Object.fromEntries(options.map((o) => [o.value, true])),
    };
  }

  const spellcasting = getSpellcastingClasses(Object.values(classesById));
  const options = spellcasting
    .map((c) => ({ value: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return {
    options,
    allowedById: Object.fromEntries(options.map((o) => [o.value, true])),
  };
}

const numToStr = (v: unknown): string =>
  v != null && Number.isFinite(Number(v)) ? String(v) : '';

const arrOrEmpty = (v: unknown): string[] =>
  Array.isArray(v) ? (v as string[]) : [];

const trim = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const strOrEmpty = (v: unknown): string => (v != null ? String(v) : '');
const trimOrNull = (v: unknown): string | null => (trim(v) ? trim(v) : null);

const parseEffectsJson = (v: unknown): SpellInput['effects'] | undefined => {
  if (v == null || v === '') return undefined;
  if (typeof v !== 'string') return undefined;
  try {
    const parsed = JSON.parse(v) as unknown;
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const formatEffectsJson = (v: unknown): string => {
  if (v == null || !Array.isArray(v)) return '[]';
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return '[]';
  }
};

/**
 * FieldSpecs whose `parse` maps directly onto SpellInput keys (plus name/image/access).
 */
export function getSpellSimpleFieldSpecs(
  options?: SpellFormFieldsOptions,
): FieldSpec<
  SpellFormValues,
  SpellInput & Record<string, unknown>,
  Spell & Record<string, unknown>
>[] {
  const { options: classOptions, allowedById } = buildSpellClassCheckboxOptions(
    options?.classesById,
  );

  return [
    {
      name: 'name',
      label: 'Name',
      kind: 'text' as const,
      required: true,
      placeholder: 'Spell name',
      defaultValue: '' as SpellFormValues['name'],
      parse: (v) => trim(v) as SpellInput['name'],
      format: (v) => strOrEmpty(v) as SpellFormValues['name'],
    },
    {
      name: 'imageKey',
      label: 'Image',
      kind: 'imageUpload' as const,
      helperText: '/assets/... or CDN key',
      defaultValue: '' as SpellFormValues['imageKey'],
      parse: (v) => trimOrNull(v) as SpellInput['imageKey'],
      format: (v) => strOrEmpty(v) as SpellFormValues['imageKey'],
    },
    {
      name: 'accessPolicy',
      label: 'Visibility',
      kind: 'visibility' as const,
      skipInForm: true,
      defaultValue: DEFAULT_VISIBILITY_PUBLIC as SpellFormValues['accessPolicy'],
      parse: (v) => (v ?? DEFAULT_VISIBILITY_PUBLIC) as SpellInput['accessPolicy'],
      format: (v) => (v ?? DEFAULT_VISIBILITY_PUBLIC) as SpellFormValues['accessPolicy'],
    },
    {
      name: SPELL_CORE_UI.school.key,
      label: SPELL_CORE_UI.school.label,
      kind: 'select' as const,
      required: true,
      options: SPELL_SCHOOL_SELECT_OPTIONS,
      placeholder: 'Select school',
      defaultValue: '' as SpellFormValues['school'],
      parse: (v: unknown) => (v ? (v as SpellInput['school']) : undefined),
      format: (v: unknown) => (v ?? '') as SpellFormValues['school'],
    },
    {
      name: SPELL_CORE_UI.level.key,
      label: SPELL_CORE_UI.level.label,
      kind: 'select' as const,
      required: true,
      options: SPELL_LEVEL_SELECT_OPTIONS,
      placeholder: 'Select level',
      defaultValue: String(SPELL_LEVELS[0]) as SpellFormValues['level'],
      parse: (v: unknown) => {
        if (v === '' || v == null) return undefined;
        const n = Number(v);
        return SPELL_LEVELS.includes(n as SpellLevel)
          ? (n as SpellInput['level'])
          : undefined;
      },
      format: (v: unknown) => numToStr(v),
    },
    {
      name: SPELL_CORE_UI.classes.key,
      label: SPELL_CORE_UI.classes.label,
      kind: 'checkboxGroup' as const,
      options: classOptions,
      defaultValue: [] as SpellFormValues['classes'],
      parse: (v: unknown) =>
        Array.isArray(v)
          ? ((v as string[]).filter((id) => id in allowedById) as SpellInput['classes'])
          : undefined,
      format: (v: unknown) =>
        arrOrEmpty(v).filter((id) => id in allowedById) as SpellFormValues['classes'],
    },
    {
      name: 'effects',
      label: 'Effects',
      kind: 'json' as const,
      placeholder: '[{ "kind": "note", "text": "..." }]',
      helperText:
        'Canonical effect objects with kind (e.g. note, modifier, grant, condition, save, activation).',
      minRows: 4,
      maxRows: 16,
      defaultValue: '[]' as SpellFormValues['effects'],
      parse: (v: unknown) => parseEffectsJson(v),
      format: (v: unknown) => formatEffectsJson(v),
      formatForDisplay: (v: unknown) => {
        const arr = Array.isArray(v) ? v : [];
        return arr.length > 0 ? `${arr.length} effect(s)` : '—';
      },
    },
  ];
}

function compositeFieldSpecs(): FieldSpec<
  SpellFormValues,
  SpellInput & Record<string, unknown>,
  Spell & Record<string, unknown>
>[] {
  return [
    {
      name: 'descriptionFull',
      label: 'Description (full)',
      kind: 'textarea' as const,
      placeholder: 'Full spell description',
      defaultValue: '' as SpellFormValues['descriptionFull'],
    },
    {
      name: 'descriptionSummary',
      label: 'Description (short)',
      kind: 'textarea' as const,
      placeholder: 'Short summary',
      defaultValue: '' as SpellFormValues['descriptionSummary'],
    },
    {
      name: 'castingTimeUnit',
      label: 'Casting time',
      kind: 'select' as const,
      required: true,
      options: SPELL_CASTING_TIME_UNIT_OPTIONS,
      defaultValue: 'action' as SpellFormValues['castingTimeUnit'],
    },
    {
      name: 'castingTimeValue',
      label: 'Casting time (value)',
      kind: 'numberText' as const,
      helperText: 'Used for minute / hour casts',
      defaultValue: '1' as SpellFormValues['castingTimeValue'],
      visibleWhen: when.or(
        when.eq('castingTimeUnit', 'minute'),
        when.eq('castingTimeUnit', 'hour'),
      ),
    },
    {
      name: 'castingTimeTrigger',
      label: 'Trigger',
      kind: 'select' as const,
      options: SPELL_TRIGGER_SELECT_OPTIONS,
      placeholder: 'Select trigger',
      defaultValue: '' as SpellFormValues['castingTimeTrigger'],
      visibleWhen: when.eq('castingTimeUnit', 'reaction'),
    },
    {
      name: 'castingTimeCanRitual',
      label: 'Can be cast as ritual',
      kind: 'checkbox' as const,
      defaultValue: false as SpellFormValues['castingTimeCanRitual'],
    },
    {
      name: 'durationKind',
      label: 'Duration',
      kind: 'select' as const,
      required: true,
      options: SPELL_DURATION_KIND_SELECT_OPTIONS,
      defaultValue: 'instantaneous' as SpellFormValues['durationKind'],
    },
    {
      name: 'durationTimedValue',
      label: 'Duration value',
      kind: 'numberText' as const,
      defaultValue: '1' as SpellFormValues['durationTimedValue'],
      visibleWhen: when.eq('durationKind', 'timed'),
    },
    {
      name: 'durationTimedUnit',
      label: 'Duration unit',
      kind: 'select' as const,
      options: SPELL_TIME_UNIT_OPTIONS,
      defaultValue: 'minute' as SpellFormValues['durationTimedUnit'],
      visibleWhen: when.eq('durationKind', 'timed'),
    },
    {
      name: 'durationTimedUpTo',
      label: 'Up to',
      kind: 'checkbox' as const,
      defaultValue: false as SpellFormValues['durationTimedUpTo'],
      visibleWhen: when.eq('durationKind', 'timed'),
    },
    {
      name: 'durationSpecialText',
      label: 'Special duration text',
      kind: 'textarea' as const,
      defaultValue: '' as SpellFormValues['durationSpecialText'],
      visibleWhen: when.eq('durationKind', 'special'),
    },
    {
      name: 'durationUntilTriggeredText',
      label: 'Until triggered (description)',
      kind: 'textarea' as const,
      defaultValue: '' as SpellFormValues['durationUntilTriggeredText'],
      visibleWhen: when.eq('durationKind', 'until-triggered'),
    },
    {
      name: 'durationTurnBoundarySubject',
      label: 'Turn boundary — subject',
      kind: 'select' as const,
      options: [
        { value: 'self', label: 'Self' },
        { value: 'source', label: 'Source' },
        { value: 'target', label: 'Target' },
      ],
      defaultValue: 'self' as SpellFormValues['durationTurnBoundarySubject'],
      visibleWhen: when.eq('durationKind', 'until-turn-boundary'),
    },
    {
      name: 'durationTurnBoundaryTurn',
      label: 'Turn boundary — turn',
      kind: 'select' as const,
      options: [
        { value: 'current', label: 'Current' },
        { value: 'next', label: 'Next' },
      ],
      defaultValue: 'current' as SpellFormValues['durationTurnBoundaryTurn'],
      visibleWhen: when.eq('durationKind', 'until-turn-boundary'),
    },
    {
      name: 'durationTurnBoundaryBoundary',
      label: 'Turn boundary — boundary',
      kind: 'select' as const,
      options: [
        { value: 'start', label: 'Start' },
        { value: 'end', label: 'End' },
      ],
      defaultValue: 'end' as SpellFormValues['durationTurnBoundaryBoundary'],
      visibleWhen: when.eq('durationKind', 'until-turn-boundary'),
    },
    {
      name: 'durationConcentration',
      label: 'Concentration',
      kind: 'checkbox' as const,
      defaultValue: false as SpellFormValues['durationConcentration'],
      visibleWhen: when.neq('durationKind', 'instantaneous'),
    },
    {
      name: 'rangeKind',
      label: 'Range',
      kind: 'select' as const,
      required: true,
      options: SPELL_RANGE_KIND_SELECT_OPTIONS,
      defaultValue: 'self' as SpellFormValues['rangeKind'],
    },
    {
      name: 'rangeDistanceValue',
      label: 'Range distance',
      kind: 'numberText' as const,
      defaultValue: '30' as SpellFormValues['rangeDistanceValue'],
      visibleWhen: when.eq('rangeKind', 'distance'),
    },
    {
      name: 'rangeDistanceUnit',
      label: 'Distance unit',
      kind: 'select' as const,
      options: SPELL_DISTANCE_UNIT_OPTIONS,
      defaultValue: 'ft' as SpellFormValues['rangeDistanceUnit'],
      visibleWhen: when.eq('rangeKind', 'distance'),
    },
    {
      name: 'rangeSpecialDescription',
      label: 'Special range description',
      kind: 'text' as const,
      defaultValue: '' as SpellFormValues['rangeSpecialDescription'],
      visibleWhen: when.eq('rangeKind', 'special'),
    },
    {
      name: 'componentIds',
      label: 'Components',
      kind: 'checkboxGroup' as const,
      options: SPELL_COMPONENT_CHECKBOX_OPTIONS,
      defaultValue: [] as SpellFormValues['componentIds'],
    },
    {
      name: 'materialDescription',
      label: 'Material (description)',
      kind: 'text' as const,
      defaultValue: '' as SpellFormValues['materialDescription'],
      visibleWhen: when.contains('componentIds', 'material'),
    },
    {
      name: 'materialCostValue',
      label: 'Material cost (value)',
      kind: 'numberText' as const,
      defaultValue: '' as SpellFormValues['materialCostValue'],
      visibleWhen: when.contains('componentIds', 'material'),
    },
    {
      name: 'materialCostUnit',
      label: 'Material cost (coin)',
      kind: 'select' as const,
      options: SPELL_MATERIAL_COIN_OPTIONS,
      defaultValue: 'gp' as SpellFormValues['materialCostUnit'],
      visibleWhen: when.contains('componentIds', 'material'),
    },
    {
      name: 'materialConsumed',
      label: 'Material consumed',
      kind: 'checkbox' as const,
      defaultValue: false as SpellFormValues['materialConsumed'],
      visibleWhen: when.contains('componentIds', 'material'),
    },
  ];
}

export function getSpellFormFields(
  options?: SpellFormFieldsOptions,
): FieldSpec<
  SpellFormValues,
  SpellInput & Record<string, unknown>,
  Spell & Record<string, unknown>
>[] {
  return [...getSpellSimpleFieldSpecs(options), ...compositeFieldSpecs()];
}

export const SPELL_FORM_FIELDS = getSpellFormFields();
