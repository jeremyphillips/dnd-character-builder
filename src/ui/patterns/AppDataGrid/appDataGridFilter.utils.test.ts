import { describe, expect, it } from 'vitest';

import type { AppDataGridFilter } from './appDataGridFilter.types';
import { getActiveFilterBadgeSegments } from './appDataGridFilter.utils';

type Row = { id: string };

const baseMulti: AppDataGridFilter<Row> = {
  id: 'classes',
  label: 'Classes',
  type: 'multiSelect',
  options: [
    { value: 'w', label: 'Wizard' },
    { value: 'f', label: 'Fighter' },
  ],
  accessor: () => [],
};

describe('getActiveFilterBadgeSegments', () => {
  it('multiSelect: one segment per selected value with removeValue', () => {
    const segs = getActiveFilterBadgeSegments(baseMulti, ['w', 'f']);
    expect(segs).toEqual([
      { label: 'Wizard', removeValue: 'w' },
      { label: 'Fighter', removeValue: 'f' },
    ]);
  });

  it('multiSelect: formatActiveChipValue string[] zips removeValue with selected order', () => {
    const f: AppDataGridFilter<Row> = {
      ...baseMulti,
      formatActiveChipValue: () => ['A', 'B'],
    };
    const segs = getActiveFilterBadgeSegments(f, ['w', 'f']);
    expect(segs).toEqual([
      { label: 'A', removeValue: 'w' },
      { label: 'B', removeValue: 'f' },
    ]);
  });

  it('select: single segment, no removeValue', () => {
    const f: AppDataGridFilter<Row> = {
      id: 'lvl',
      label: 'Level',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: '1', label: '1st' },
      ],
      accessor: () => '1',
    };
    expect(getActiveFilterBadgeSegments(f, '1')).toEqual([{ label: '1st' }]);
  });
});
