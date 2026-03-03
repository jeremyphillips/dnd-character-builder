import type { Spell } from '@/features/content/domain/types/spell.types';
import type { DetailSpec } from '@/features/content/forms/registry';
import { MAGIC_SCHOOL_OPTIONS } from '@/features/content/domain/vocab';

const SPELL_CLASS_LABELS: Record<string, string> = {
  bard: 'Bard',
  cleric: 'Cleric',
  druid: 'Druid',
  paladin: 'Paladin',
  ranger: 'Ranger',
  sorcerer: 'Sorcerer',
  warlock: 'Warlock',
  wizard: 'Wizard',
};

const schoolLabel = (value: string) =>
  MAGIC_SCHOOL_OPTIONS.find((o) => o.value === value)?.label ?? value;

export const SPELL_DETAIL_SPECS: DetailSpec<Spell, unknown>[] = [
  {
    key: 'name',
    label: 'Name',
    order: 10,
    render: (spell) => spell.name,
  },
  {
    key: 'school',
    label: 'School',
    order: 20,
    render: (spell) => schoolLabel(spell.school),
  },
  {
    key: 'level',
    label: 'Level',
    order: 30,
    render: (spell) => (spell.level === 0 ? 'Cantrip' : `${spell.level}`),
  },
  {
    key: 'classes',
    label: 'Classes',
    order: 40,
    render: (spell) =>
      spell.classes
        .map((c) => SPELL_CLASS_LABELS[c] ?? c)
        .join(', ') || '—',
  },
  {
    key: 'ritual',
    label: 'Ritual',
    order: 50,
    render: (spell) => (spell.ritual ? 'Yes' : 'No'),
  },
  {
    key: 'concentration',
    label: 'Concentration',
    order: 60,
    render: (spell) => (spell.concentration ? 'Yes' : 'No'),
  },
  {
    key: 'effects',
    label: 'Effects',
    order: 70,
    render: (spell) => {
      const arr = spell.effects;
      if (!arr || arr.length === 0) return '—';
      return `${arr.length} effect(s)`;
    },
  },
];
