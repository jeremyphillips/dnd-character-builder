import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider';
import { useCampaignRules } from '@/app/providers/CampaignRulesProvider';
import {
  ContentTypeListPage,
  buildCampaignContentColumns,
  buildCampaignContentFilters,
} from '@/features/content/components';
import { useCampaignContentListController } from '@/features/content/hooks/useCampaignContentListController';
import { raceRepo } from '@/features/content/domain/repo';
import type { RaceSummary } from '@/features/content/domain/types';
import { useBreadcrumbs } from '@/hooks';
import { toViewerContext, canManageContent } from '@/shared/domain/capabilities';

export default function RaceListRoute() {
  const { campaign, campaignId } = useActiveCampaign();
  const { catalog } = useCampaignRules();
  const breadcrumbs = useBreadcrumbs();
  const basePath = `/campaigns/${campaignId}/world/races`;

  const ctx = toViewerContext(campaign?.viewer);
  const canManage = canManageContent(ctx);
  const viewerCharacterIds = campaign?.members?.viewerCharacterIds ?? [];

  const listSummaries = useCallback(
    (cid: string, sid: string) =>
      raceRepo.listSummaries(cid, sid, { catalog }),
    [catalog],
  );

  const controller = useCampaignContentListController({
    campaignId,
    viewer: campaign?.viewer,
    viewerCharacterIds,
    canManage,
    listSummaries,
    contentKey: 'races',
    basePath,
  });

  const columns = useMemo(
    () =>
      buildCampaignContentColumns<RaceSummary>({
        canManage,
        onToggleAllowedInCampaign: controller.onToggleAllowed,
      }),
    [canManage, controller.onToggleAllowed],
  );

  const filters = useMemo(
    () =>
      buildCampaignContentFilters<RaceSummary>({
        canManage,
        onToggleAllowedInCampaign: controller.onToggleAllowed,
      }),
    [canManage, controller.onToggleAllowed],
  );

  if (controller.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ContentTypeListPage<RaceSummary>
      typeLabel="Race"
      typeLabelPlural="Races"
      headline="Races"
      breadcrumbData={breadcrumbs}
      actions={[
        <Button
          key="back"
          component={Link}
          to={`/campaigns/${campaignId}/world`}
          size="small"
          startIcon={<ArrowBackIcon />}
        >
          World
        </Button>,
      ]}
      rows={controller.items as RaceSummary[]}
      columns={columns}
      filters={filters}
      getRowId={(r) => r.id}
      getDetailLink={controller.getDetailLink}
      loading={controller.loading}
      error={controller.error}
      toolbar={
        canManage ? (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={controller.onAdd}
          >
            Add Race
          </Button>
        ) : undefined
      }
      searchPlaceholder="Search races…"
      emptyMessage="No races found."
      density="compact"
      height={560}
    />
  );
}
