/**
 * Location create/edit form values — extends shared content form contract.
 */
import type { ContentFormValues } from '@/features/content/shared/domain/types';

export type LocationFormValues = ContentFormValues & {
  scale: string;
  category: string;
  parentId: string;
  /** When true, bootstrap a default LocationMap with grid columns/rows/cell unit */
  createGrid: boolean;
  /** Preset key — fills columns/rows when set */
  gridPreset: string;
  gridColumns: string;
  gridRows: string;
  gridCellUnit: string;
  labelShort: string;
  labelNumber: string;
  sortOrder: string;
  aliases: string;
  tags: string;
};
