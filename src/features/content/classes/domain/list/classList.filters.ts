import type { AppDataGridFilter } from '@/ui/patterns';
import type { ClassListRow } from './classList.types';
import {
  buildHitDieOptions,
  SPELLCASTING_FILTER_OPTIONS,
  PRIMARY_ABILITY_OPTIONS,
} from './classList.options';
import type { ClassSummary } from '../repo/classRepo';

export function buildClassListFilters(
  items: ClassSummary[],
): AppDataGridFilter<ClassListRow>[] {
  const hitDieOptions = buildHitDieOptions(items);

  return [
    {
      id: 'hitDie',
      label: 'Hit Die',
      type: 'select' as const,
      options: hitDieOptions,
      accessor: (r) =>
        r.progression?.hitDie != null ? String(r.progression.hitDie) : '',
    },
    {
      id: 'spellcasting',
      label: 'Spellcasting',
      type: 'select' as const,
      options: SPELLCASTING_FILTER_OPTIONS,
      accessor: (r) => r.progression?.spellcasting ?? 'none',
    },
    {
      id: 'primaryAbilities',
      label: 'Primary Abilities',
      type: 'multiSelect' as const,
      options: PRIMARY_ABILITY_OPTIONS,
      accessor: (r) => r.generation?.primaryAbilities ?? [],
    },
  ];
}
