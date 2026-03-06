import type { AppDataGridColumn } from '@/ui/patterns';
import { formatCp } from '@/shared/money';
import type { GearListRow } from './gearList.types';

const EMPTY_PLACEHOLDER = '—';

/**
 * Returns custom columns for the gear list.
 */
export function buildGearCustomColumns(): AppDataGridColumn<GearListRow>[] {
  return [
    {
      field: 'category',
      headerName: 'Category',
      width: 160,
    },
    {
      field: 'costCp',
      headerName: 'Cost',
      width: 110,
      type: 'number' as const,
      valueFormatter: (v: unknown) => formatCp(v as number),
    },
    {
      field: 'weightLb',
      headerName: 'Weight (lb)',
      width: 120,
      type: 'number' as const,
      valueFormatter: (v: unknown) =>
        v != null ? `${v} lb` : EMPTY_PLACEHOLDER,
    },
  ];
}
