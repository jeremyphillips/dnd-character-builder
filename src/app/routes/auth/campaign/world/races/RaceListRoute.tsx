import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider';
import { raceRepo } from '@/features/content/domain/repo';
import type { RaceSummary } from '@/features/content/domain/types';
import { DEFAULT_SYSTEM_RULESET_ID } from '@/features/mechanics/domain/core/rules/systemIds';
import { AppDataGrid } from '@/ui/patterns';
import type { AppDataGridColumn, AppDataGridFilter } from '@/ui/patterns';
import { AppPageHeader } from '@/ui/patterns';
import { useBreadcrumbs } from '@/hooks';
import { toViewerContext, canManageContent } from '@/shared/domain/capabilities';
import { AppAlert } from '@/ui/primitives';

export default function RaceListRoute() {
  const { campaign, campaignId } = useActiveCampaign();
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const basePath = `/campaigns/${campaignId}/world/races`;

  const ctx = toViewerContext(campaign?.viewer);
  const canManage = canManageContent(ctx);

  const [items, setItems] = useState<RaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    setLoading(true);

    raceRepo.listSummaries(campaignId, DEFAULT_SYSTEM_RULESET_ID)
      .then(data => { if (!cancelled) setItems(data); })
      .catch(err => { if (!cancelled) setError((err as Error).message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [campaignId]);

  const sourceOptions = useMemo(() => [
    { label: 'All', value: '' },
    { label: 'System', value: 'system' },
    { label: 'Campaign', value: 'campaign' },
  ], []);

  const columns: AppDataGridColumn<RaceSummary>[] = useMemo(() => [
    { field: 'imageKey', headerName: '', width: 56, imageColumn: true, imageSize: 32, imageShape: 'rounded', imageAltField: 'name' },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160, linkColumn: true },
    { field: 'source', headerName: 'Source', width: 100, valueFormatter: (v) => (v != null ? String(v) : '—') },
  ], []);

  const filters: AppDataGridFilter<RaceSummary>[] = useMemo(() => [
    { id: 'source', label: 'Source', type: 'select' as const, options: sourceOptions, accessor: (r: RaceSummary) => r.source },
  ], [sourceOptions]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <AppAlert tone="danger">{error}</AppAlert>;
  }

  return (
    <Box>
      <AppPageHeader
        headline="Races"
        breadcrumbData={breadcrumbs}
        actions={[
          <Button key="back" component={Link} to={`/campaigns/${campaignId}/world`} size="small" startIcon={<ArrowBackIcon />}>World</Button>,
        ]}
      />
      <AppDataGrid
        rows={items}
        columns={columns}
        getRowId={r => r.id}
        getDetailLink={r => `${basePath}/${r.id}`}
        filters={filters}
        searchable
        searchPlaceholder="Search races…"
        searchColumns={['name']}
        emptyMessage="No races found."
        density="compact"
        height={560}
        toolbar={
          canManage && (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => navigate(`${basePath}/new`)}>
              Add Race
            </Button>
          )
        }
      />
    </Box>
  );
}
