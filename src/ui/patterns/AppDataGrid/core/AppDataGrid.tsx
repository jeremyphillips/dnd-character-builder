import { useState, useMemo, useCallback, type ReactNode } from 'react'

import { DataGrid } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import GlobalStyles from '@mui/material/GlobalStyles'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import { AppBadge, AppMultiSelectCheckbox, AppSelect, AppTextField, AppTooltip } from '@/ui/primitives'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SearchIcon from '@mui/icons-material/Search'

import { ContentToolbarDiscreteRangeField } from '@/features/content/shared/components'

import {
  APP_DATA_GRID_ALLOWED_IN_CAMPAIGN_FILTER_ID,
  type AppDataGridFilter,
  type AppDataGridProps,
  type FilterOption,
} from '../types'
import {
  getFilterDefault,
  getActiveFilterBadgeSegments,
  getClampedRangeFilterValue,
  indexFiltersById,
} from '../filters'
import type { MuiDenseInputSize, MuiTextFieldSize } from '@/ui/sizes'
import { buildMuiColumns } from './appDataGridColumns'
import {
  filterRows,
  isFilterValueActive,
  truncateToolbarSearchLabel,
} from './appDataGridFiltering'


// ---------------------------------------------------------------------------
// COLUMN SPECIAL BEHAVIORS (applied in order, later wins):
// ---------------------------------------------------------------------------
// 1. renderCell    — custom cell renderer (baseline)
// 2. imageColumn   — renders an Avatar thumbnail via resolveImageUrl
// 3. linkColumn    — wraps whatever is rendered above in a router Link
// 4. switchColumn  — renders a toggle Switch; overrides everything above
//
// imageColumn + linkColumn can be combined (Avatar wrapped in a Link).
// switchColumn always takes final priority.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Inline toolbar filters: primitives default `fullWidth`; keep shrink-to-min in horizontal `Stack`. */
const APP_DATA_GRID_FILTER_FIELD_SX = { minWidth: 160, width: 'auto', flex: '0 1 auto' }

/** When options include `value: ''` (e.g. "All"), pass label as placeholder for AppSelect empty state. */
function selectPlaceholderForFilterOptions(options: FilterOption[]): string | undefined {
  const empty = options.find((o) => o.value === '')
  return empty?.label
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AppDataGrid<T>({
  rows,
  columns,
  getRowId,
  getDetailLink,
  toolbarConfig,
  selection,
  presentation,
}: AppDataGridProps<T>) {
  const tc = toolbarConfig
  const filterBundle = tc?.filters
  const onFilterValueChange = filterBundle?.onValueChange
  const initialFilterValues = filterBundle?.initialValues

  const searchCfg = tc?.search
  const searchable = searchCfg?.enabled ?? false
  const searchPlaceholder = searchCfg?.placeholder ?? 'Search…'
  const searchRowMatch = searchCfg?.rowMatch
  const searchColumns = searchCfg?.columns

  const primaryFieldSize: MuiTextFieldSize = tc?.fieldSizes?.primary ?? 'medium'
  const secondaryFieldSize: MuiDenseInputSize = tc?.fieldSizes?.secondary ?? 'small'
  const toolbar = tc?.actions
  const toolbarLayout = tc?.layout

  const pres = presentation
  const loading = pres?.loading ?? false
  const emptyMessage = pres?.emptyMessage ?? 'No data.'
  const pageSizeOptions = pres?.pageSizeOptions ?? [10, 25, 50]
  const density = pres?.density ?? 'standard'
  const height = pres?.height ?? 400
  const getRowClassName = pres?.getRowClassName

  const multiSelect = selection?.enabled ?? false

  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>(
    () => ({ ...initialFilterValues }),
  )

  const setFilterValue = useCallback(
    (id: string, value: unknown) => {
      setFilterValues((prev) => ({ ...prev, [id]: value }))
      onFilterValueChange?.(id, value)
    },
    [onFilterValueChange],
  )

  const resolvedFilters = useMemo<AppDataGridFilter<T>[]>(
    () => filterBundle?.definitions ?? [],
    [filterBundle?.definitions],
  )

  const getFilterValue = useCallback(
    (f: AppDataGridFilter<T>): unknown =>
      filterValues[f.id] ?? getFilterDefault(f),
    [filterValues],
  )

  // ── Filtering & searching ─────────────────────────────────────────
  const filteredRows = useMemo(
    () =>
      filterRows({
        rows,
        columns,
        filters: resolvedFilters,
        filterValues,
        searchable,
        search,
        searchRowMatch,
        searchColumns,
      }),
    [rows, columns, resolvedFilters, filterValues, searchable, search, searchRowMatch, searchColumns],
  )

  // ── Map AppDataGridColumn → MUI GridColDef ────────────────────────
  const muiColumns = useMemo(
    () => buildMuiColumns({ columns, getDetailLink }),
    [columns, getDetailLink],
  )

  const filterById = useMemo(
    () => indexFiltersById(resolvedFilters),
    [resolvedFilters],
  )

  const hasActiveToolbarState = useMemo(() => {
    if (search.trim()) return true
    return resolvedFilters.some((f) => {
      const cur = filterValues[f.id] ?? getFilterDefault(f)
      return isFilterValueActive(f, cur)
    })
  }, [filterValues, resolvedFilters, search])

  /** Clears search and runtime filters only; does not PATCH persisted user preferences. */
  const resetToolbar = useCallback(() => {
    setSearch('')
    setFilterValues({})
  }, [])

  const renderFilterControl = useCallback(
    (f: AppDataGridFilter<T>, size: MuiTextFieldSize) => {
      const labelEndAdornment = f.description ? (
        <AppTooltip title={f.description}>
          <IconButton size="small" aria-label="Filter info" sx={{ p: 0.25 }}>
            <InfoOutlinedIcon fontSize="inherit" />
          </IconButton>
        </AppTooltip>
      ) : undefined
      const rangeSize: MuiDenseInputSize = size === 'large' ? 'medium' : size
      switch (f.type) {
        case 'select': {
          const placeholder = selectPlaceholderForFilterOptions(f.options)
          return (
            <AppSelect
              label={f.label}
              labelEndAdornment={labelEndAdornment}
              options={f.options}
              value={getFilterValue(f) as string}
              onChange={(v) => setFilterValue(f.id, v)}
              size={size}
              fullWidth={false}
              sx={APP_DATA_GRID_FILTER_FIELD_SX}
              placeholder={placeholder}
            />
          )
        }
        case 'multiSelect':
          return (
            <AppMultiSelectCheckbox
              label={f.label}
              labelEndAdornment={labelEndAdornment}
              options={f.options}
              value={(getFilterValue(f) as string[]) ?? []}
              onChange={(v) => setFilterValue(f.id, v)}
              size={size}
              fullWidth={false}
              displayMode="summary"
              sx={APP_DATA_GRID_FILTER_FIELD_SX}
            />
          )
        case 'boolean':
          return (
            <AppSelect
              label={f.label}
              labelEndAdornment={labelEndAdornment}
              options={[
                { value: 'all', label: 'All' },
                { value: 'true', label: f.trueLabel ?? 'Yes' },
                { value: 'false', label: f.falseLabel ?? 'No' },
              ]}
              value={getFilterValue(f) as string}
              onChange={(v) => setFilterValue(f.id, v)}
              size={size}
              fullWidth={false}
              sx={APP_DATA_GRID_FILTER_FIELD_SX}
            />
          )
        case 'range': {
          const clamped = getClampedRangeFilterValue(f, getFilterValue(f))
          return (
            <ContentToolbarDiscreteRangeField
              label={f.label}
              steps={f.steps}
              value={clamped}
              onChange={(next) => setFilterValue(f.id, next)}
              formatValue={f.formatStepValue}
              size={rangeSize}
            />
          )
        }
      }
    },
    [getFilterValue, setFilterValue],
  )

  const renderFilterById = useCallback(
    (id: string, size: MuiTextFieldSize) => {
      const f = filterById.get(id)
      if (!f) return null
      return renderFilterControl(f, size)
    },
    [filterById, renderFilterControl],
  )

  const badgeElements = useMemo(() => {
    if (!toolbarLayout) return []
    const out: ReactNode[] = []
    if (search.trim()) {
      out.push(
        <AppBadge
          key="search"
          size="small"
          variant="outlined"
          label={`Search: ${truncateToolbarSearchLabel(search)}`}
          onDelete={() => setSearch('')}
        />,
      )
    }
    for (const f of resolvedFilters) {
      const cur = filterValues[f.id] ?? getFilterDefault(f)
      if (!isFilterValueActive(f, cur)) continue
      const segments = getActiveFilterBadgeSegments(f, cur).filter((s) => s.label.trim() !== '')
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]!
        const showPrefix = Boolean(f.badgePrefixFilterLabel)
        const badgeLabel = showPrefix ? `${f.label}: ${seg.label}` : seg.label
        out.push(
          <AppBadge
            key={`filter-${f.id}-${seg.removeValue ?? i}`}
            size="small"
            variant="outlined"
            label={badgeLabel}
            onDelete={() => {
              if (seg.removeValue !== undefined && f.type === 'multiSelect') {
                const arr = ((cur as string[]) ?? []).filter((v) => v !== seg.removeValue)
                setFilterValue(f.id, arr)
              } else {
                setFilterValue(f.id, getFilterDefault(f))
              }
            }}
          />,
        )
      }
    }
    return out
  }, [toolbarLayout, search, filterValues, resolvedFilters, setFilterValue])

  const gapPrimary = primaryFieldSize === 'small' ? 1.5 : 3
  const gapSecondary = secondaryFieldSize === 'small' ? 1.5 : 3
  const primaryIds = toolbarLayout?.primary ?? []
  const secondaryIds = toolbarLayout?.secondary ?? []

  const allowedFilter = filterById.get(APP_DATA_GRID_ALLOWED_IN_CAMPAIGN_FILTER_ID)
  const allowedValue = allowedFilter
    ? (getFilterValue(allowedFilter) as string)
    : 'all'
  const showHideDisallowedUtility =
    Boolean(toolbarLayout?.utilities?.includes('hideDisallowed')) &&
    allowedFilter?.type === 'boolean' &&
    allowedValue !== 'false'

  const hideDisallowedChecked = allowedValue === 'true'

  // ── Render ────────────────────────────────────────────────────────
  const showToolbar =
    toolbar || searchable || resolvedFilters.length > 0 || Boolean(toolbarLayout)

  return (
    <Box>
      {showToolbar && (
        <>
          {toolbarLayout ? (
            <Stack spacing={2} sx={{ mb: 1.5 }}>
              <Stack
                direction="row"
                flexWrap="wrap"
                alignItems="center"
                gap={gapPrimary}
                sx={{ width: '100%' }}
              >
                {searchable && (
                  <AppTextField
                    size={primaryFieldSize}
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ minWidth: 260 }}
                  />
                )}
                {primaryIds.map((id) => {
                  const el = renderFilterById(id, primaryFieldSize)
                  return el ? <Box key={id}>{el}</Box> : null
                })}
                {toolbar && <Box sx={{ ml: 'auto' }}>{toolbar}</Box>}
              </Stack>

              {(secondaryIds.length > 0 || showHideDisallowedUtility) && (
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  alignItems="center"
                  justifyContent={showHideDisallowedUtility ? 'space-between' : 'flex-start'}
                  gap={gapSecondary}
                  sx={{ width: '100%' }}
                >
                  <Stack direction="row" flexWrap="wrap" alignItems="center" gap={gapSecondary}>
                    {secondaryIds.map((id) => {
                      const el = renderFilterById(id, secondaryFieldSize)
                      return el ? <Box key={id}>{el}</Box> : null
                    })}
                  </Stack>
                  {showHideDisallowedUtility && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={hideDisallowedChecked}
                          onChange={(_e, checked) =>
                            setFilterValue(
                              APP_DATA_GRID_ALLOWED_IN_CAMPAIGN_FILTER_ID,
                              checked ? 'true' : 'all',
                            )
                          }
                          size="small"
                        />
                      }
                      label="Hide disallowed"
                      sx={(theme) => ({
                        flexShrink: 0,
                        '& .MuiFormControlLabel-label': {
                          ...theme.typography.body2,
                        },
                      })}
                    />
                  )}
                </Stack>
              )}

              <Box
                sx={{
                  minHeight: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                  rowGap: 1,
                  mt: 0,
                }}
              >
                {hasActiveToolbarState && (
                  <>
                    {badgeElements}
                    <Button size="small" variant="text" onClick={resetToolbar}>
                      Reset
                    </Button>
                  </>
                )}
              </Box>
            </Stack>
          ) : (
            <Stack
              direction="row"
              sx={{
                mb: 3,
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: primaryFieldSize === 'small' ? 1.5 : 3,
              }}
            >
              {searchable && (
                <AppTextField
                  size={primaryFieldSize}
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ minWidth: 260 }}
                />
              )}

              {resolvedFilters.map((f) => (
                <Box key={f.id}>{renderFilterControl(f, primaryFieldSize)}</Box>
              ))}

              {toolbar && <Box sx={{ ml: 'auto' }}>{toolbar}</Box>}
            </Stack>
          )}
        </>
      )}

      <GlobalStyles
        styles={{
          '.AppDataGrid-row--disabled': {
            opacity: '0.6 !important',
          },
        }}
      />
      <Box sx={{ height, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={muiColumns}
          getRowId={(row) => getRowId(row as T)}
          getRowClassName={getRowClassName}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
          loading={loading}
          pageSizeOptions={pageSizeOptions}
          density={density}
          checkboxSelection={multiSelect}
          disableRowSelectionOnClick={!multiSelect}
          disableColumnFilter
          disableColumnMenu
          slots={{
            noRowsOverlay: () => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </Box>
            ),
          }}
        />
      </Box>
    </Box>
  )
}
