/**
 * Centralized builders for campaign content list pages.
 *
 * Composes shared pre/post columns and filters with route-specific custom
 * columns/filters. Use buildCampaignContentColumns and buildCampaignContentFilters
 * for full composition, or the smaller helpers for custom composition.
 */
import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import type { AppDataGridColumn, AppDataGridFilter } from '@/ui/patterns';
import { makeOwnedColumn, makeOwnedFilter } from '@/ui/patterns';
import { AppBadge } from '@/ui/primitives';
import type { Visibility } from '@/shared/types/visibility';
import type { GridRenderCellParams } from '@mui/x-data-grid';
import { canViewContent, type ViewerContext } from '@/shared/domain/capabilities';
import {
  SOURCE_FILTER_OPTIONS,
  formatContentSource,
} from '@/features/content/domain/sourceLabels';

// ---------------------------------------------------------------------------
// Row type constraints
// ---------------------------------------------------------------------------

export type CampaignContentListRow = {
  id: string;
  name: string;
  imageKey?: string | null;
  source?: string | null;
  accessPolicy?: Visibility;
};

// ---------------------------------------------------------------------------
// Visibility column (managers only)
// ---------------------------------------------------------------------------

const VISIBILITY_FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Public', value: 'public' },
  { label: 'Restricted', value: 'restricted' },
  { label: 'DM only', value: 'dm' },
] as const;

const VISIBILITY_SCOPE_META: Record<
  string,
  { icon: ReactNode; label: string; tone: 'info' | 'warning' | 'danger' | 'default' }
> = {
  public: {
    icon: <VisibilityIcon fontSize="small" />,
    label: 'Public',
    tone: 'info',
  },
  restricted: {
    icon: <LockIcon fontSize="small" />,
    label: 'Restricted',
    tone: 'warning',
  },
  dm: {
    icon: <VisibilityOffIcon fontSize="small" />,
    label: 'Hidden',
    tone: 'danger',
  },
};

function getVisibilityMeta(scope: string | undefined) {
  return VISIBILITY_SCOPE_META[scope ?? 'public'] ?? VISIBILITY_SCOPE_META.public;
}

// ---------------------------------------------------------------------------
// Column helpers
// ---------------------------------------------------------------------------

export function makePreColumns<T extends CampaignContentListRow>(params: {
  canManage?: boolean;
}): AppDataGridColumn<T>[] {
  const { canManage = false } = params;

  const nameColumn: AppDataGridColumn<T> = {
    field: 'name',
    headerName: 'Name',
    flex: 1,
    minWidth: 160,
    linkColumn: true,
  };

  if (!canManage) {
    nameColumn.renderCell = (params: GridRenderCellParams) => {
      const row = params.row as T & { accessPolicy?: { scope?: string } };
      const policy = row.accessPolicy;
      const isRestricted = policy?.scope === 'restricted';
      const name = (params.value as string) ?? '';
      return (
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ overflow: 'hidden' }}>
          {isRestricted && (
            <LockOutlinedIcon
              sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }}
            />
          )}
          <Typography component="span" noWrap variant="body2">
            {name}
          </Typography>
        </Stack>
      );
    };
  }

  return [
    {
      field: 'imageKey',
      headerName: '',
      width: 56,
      imageColumn: true,
      imageSize: 32,
      imageShape: 'rounded',
      imageAltField: 'name',
    },
    nameColumn,
  ];
}

export function makePostColumns<T extends CampaignContentListRow>(params: {
  ownedIds?: ReadonlySet<string>;
  canManage?: boolean;
  onToggleAllowedInCampaign?: (id: string, checked: boolean) => void;
  /** Backend may return 'allowed'; use this to map. Default: 'allowedInCampaign' */
  allowedField?: keyof T;
}): AppDataGridColumn<T>[] {
  const {
    ownedIds,
    canManage = false,
    onToggleAllowedInCampaign,
    allowedField = 'allowedInCampaign' as keyof T,
  } = params;

  const cols: AppDataGridColumn<T>[] = [];

  if (ownedIds != null && ownedIds.size > 0) {
    cols.push(makeOwnedColumn<T>({ ownedIds }));
  }

  cols.push({
    field: 'source',
    headerName: 'Source',
    width: 100,
    valueFormatter: (v) => formatContentSource(v as string | null | undefined),
  });

  if (canManage) {
    cols.push({
      field: 'accessPolicy',
      headerName: 'Visibility',
      width: 110,
      renderCell: (params) => {
        const row = params.row as T & { accessPolicy?: { scope?: string } };
        const scope = row.accessPolicy?.scope;
        const meta = getVisibilityMeta(scope);
        return (
          <AppBadge label={meta.label} icon={meta.icon} tone={meta.tone} />
        );
      },
    });
  }

  if (canManage && onToggleAllowedInCampaign) {
    cols.push({
      field: 'allowedInCampaign',
      headerName: 'Allowed',
      width: 100,
      switchColumn: true,
      accessor: (row) => (row as Record<string, unknown>)[allowedField as string] as boolean,
      onSwitchChange: (row, checked) => onToggleAllowedInCampaign(row.id, checked),
    });
  }

  return cols;
}

export function buildCampaignContentColumns<T extends CampaignContentListRow>(params: {
  customColumns?: AppDataGridColumn<T>[];
  ownedIds?: ReadonlySet<string>;
  canManage?: boolean;
  onToggleAllowedInCampaign?: (id: string, checked: boolean) => void;
  allowedField?: keyof T;
}): AppDataGridColumn<T>[] {
  const { customColumns = [] } = params;
  const pre = makePreColumns<T>({ canManage: params.canManage });
  const post = makePostColumns<T>(params);
  return [...pre, ...customColumns, ...post];
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

export function makePostFilters<T extends CampaignContentListRow>(params: {
  ownedIds?: ReadonlySet<string>;
  canManage?: boolean;
  /** When provided with canManage, include allowedInCampaign column. Filter shows when canManage. */
  onToggleAllowedInCampaign?: (id: string, checked: boolean) => void;
  /** Backend may return 'allowed'; use this to map. Default: 'allowedInCampaign' */
  allowedField?: keyof T;
  /**
   * When true and canManage is false, add "Private to me" boolean filter.
   * Requires viewerContext. Opt-in per route (e.g. NPC lists).
   */
  enablePrivateToMeFilter?: boolean;
  /** Required when enablePrivateToMeFilter is true. Used to determine restricted items visible to viewer. */
  viewerContext?: ViewerContext;
}): AppDataGridFilter<T>[] {
  const {
    ownedIds,
    canManage = false,
    allowedField = 'allowedInCampaign' as keyof T,
    enablePrivateToMeFilter = false,
    viewerContext,
  } = params;

  const filters: AppDataGridFilter<T>[] = [];

  if (ownedIds != null && ownedIds.size > 0) {
    filters.push(makeOwnedFilter<T>({ ownedIds }));
  }

  if (enablePrivateToMeFilter && !canManage && viewerContext) {
    filters.push({
      id: 'privateToMe',
      label: 'Private to me',
      type: 'boolean',
      defaultValue: 'all',
      trueLabel: 'Only private',
      accessor: (row) => {
        const policy = (row as T & { accessPolicy?: Visibility }).accessPolicy;
        if (!policy) return false;
        if (policy.scope !== 'restricted') return false;
        return canViewContent(viewerContext, policy);
      },
    });
  }

  if (canManage) {
    filters.push({
      id: 'source',
      label: 'Source',
      type: 'select',
      options: [...SOURCE_FILTER_OPTIONS],
      accessor: (row) => (row as CampaignContentListRow).source ?? 'system',
      defaultValue: 'all',
    });
    filters.push({
      id: 'visibility',
      label: 'Visibility',
      type: 'select',
      options: [...VISIBILITY_FILTER_OPTIONS],
      accessor: (row) => {
        const policy = (row as T & { accessPolicy?: { scope?: string } }).accessPolicy;
        return policy?.scope ?? 'public';
      },
      defaultValue: 'all',
    });
    filters.push({
      id: 'allowedInCampaign',
      label: 'Allowed',
      type: 'boolean',
      trueLabel: 'Allowed',
      falseLabel: 'Not Allowed',
      accessor: (row) => Boolean((row as Record<string, unknown>)[allowedField as string]),
    });
  }

  return filters;
}

export function buildCampaignContentFilters<T extends CampaignContentListRow>(params: {
  customFilters?: AppDataGridFilter<T>[];
  ownedIds?: ReadonlySet<string>;
  canManage?: boolean;
  /** When provided with canManage, include allowedInCampaign column. Filter shows when canManage. */
  onToggleAllowedInCampaign?: (id: string, checked: boolean) => void;
  allowedField?: keyof T;
  /**
   * When true and canManage is false, add "Private to me" boolean filter.
   * Requires viewerContext. Opt-in per route (e.g. NPC lists).
   */
  enablePrivateToMeFilter?: boolean;
  /** Required when enablePrivateToMeFilter is true. */
  viewerContext?: ViewerContext;
}): AppDataGridFilter<T>[] {
  const { customFilters = [] } = params;
  const post = makePostFilters<T>(params);
  return [...customFilters, ...post];
}
