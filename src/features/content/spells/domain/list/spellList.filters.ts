import type { AppDataGridFilter } from '@/ui/patterns';
import type { SpellListRow } from './spellList.types';
import type { SpellSummary } from '../repo/spellRepo';
import { getSpellResolutionStatus } from '@/features/content/spells/domain/types';
import {
  buildSchoolOptions,
  buildLevelOptions,
  buildClassOptions,
} from './spellList.options';

export function buildSpellCustomFilters(
  items: SpellSummary[],
  classesById: Record<string, { name?: string }> | undefined,
): AppDataGridFilter<SpellListRow>[] {
  const schoolOptions = buildSchoolOptions(items);
  const levelOptions = buildLevelOptions(items);
  const classOptions = buildClassOptions(items, classesById);

  return [
    {
      id: 'school',
      label: 'School',
      type: 'select' as const,
      options: schoolOptions,
      accessor: (r) => r.school,
    },
    {
      id: 'level',
      label: 'Level',
      type: 'select' as const,
      options: levelOptions,
      accessor: (r) => String(r.level),
    },
    {
      id: 'classes',
      label: 'Class',
      type: 'multiSelect' as const,
      options: classOptions,
      accessor: (r) => r.classes ?? [],
    },
    {
      id: 'resolutionStatus',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All', value: '' },
        { label: 'Stub', value: 'stub' },
        { label: 'Partial', value: 'partial' },
        { label: 'Full', value: 'full' },
      ],
      accessor: (r) => getSpellResolutionStatus(r),
    },
  ];
}
