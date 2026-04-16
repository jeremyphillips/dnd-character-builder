import { useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider';
import {
  ContentTypeListPage,
  buildCampaignContentColumns,
  buildCampaignContentFilters,
  ValidationBlockedAlert,
} from '@/features/content/shared/components';
import { useCampaignContentListController } from '@/features/content/shared/hooks/useCampaignContentListController';
import {
  useValidatedAllowedToggle,
  type ValidationBlockedState,
} from '@/features/content/shared/hooks/useValidatedAllowedToggle';
import { useCampaignPartyCharacterNameMap } from '@/features/content/shared/hooks/useCampaignPartyCharacterNameMap';
import { useViewerProficiencies } from '@/features/campaign/hooks';
import {
  skillProficiencyRepo,
  validateSkillProficiencyChange,
  buildSkillProficiencyCustomColumns,
  buildSkillProficiencyCustomFilters,
  type SkillProficiencyListRow,
} from '@/features/content/skillProficiencies/domain';
import type { SkillProficiencySummary } from '@/features/content/skillProficiencies/domain/types';
import type { GridRowClassNameParams } from '@mui/x-data-grid';
import { useBreadcrumbs } from '@/app/navigation';
import { toViewerContext, canManageContent } from '@/shared/domain/capabilities';
import { AppAlert } from '@/ui/primitives';
import { useCampaignRules } from '@/app/providers/CampaignRulesProvider';

export default function SkillProficiencyListRoute() {
  const { campaign, campaignId } = useActiveCampaign();
  const { catalog } = useCampaignRules();
  const breadcrumbs = useBreadcrumbs();
  const basePath = `/campaigns/${campaignId}/world/skill-proficiencies`;

  const ctx = toViewerContext(campaign?.viewer);
  const canManage = canManageContent(ctx);
  const viewerCharacterIds = campaign?.members?.viewerCharacterIds ?? [];

  const { skills: ownedIds } = useViewerProficiencies();

  const listSummaries = useCallback(
    (cid: string, sid: string) =>
      skillProficiencyRepo.listSummaries(cid, sid) as Promise<SkillProficiencySummary[]>,
    [],
  );

  const controller = useCampaignContentListController({
    campaignId,
    viewer: campaign?.viewer,
    viewerCharacterIds,
    canManage,
    listSummaries,
    contentKey: 'skillProficiencies',
    basePath,
  });

  const { characterNameById } = useCampaignPartyCharacterNameMap(
    campaignId,
    canManage,
  );

  const [validationBlocked, setValidationBlocked] = useState<ValidationBlockedState | null>(null);

  const handleToggleAllowed = useValidatedAllowedToggle({
    campaignId,
    onToggleAllowed: controller.onToggleAllowed,
    setValidationBlocked,
    validateDisallow: (id) =>
      validateSkillProficiencyChange({
        campaignId: campaignId!,
        skillProficiencyId: id,
        mode: 'disallow',
      }),
  });

  const items = controller.items as SkillProficiencyListRow[];
  const hasCampaignSources = items.some((r) => (r as { source?: string }).source === 'campaign');

  const customColumns = useMemo(
    () => buildSkillProficiencyCustomColumns(catalog.classesById),
    [catalog.classesById],
  );

  const customFilters = useMemo(
    () => buildSkillProficiencyCustomFilters(items, catalog.classesById),
    [items, catalog.classesById],
  );

  const columns = useMemo(
    () =>
      buildCampaignContentColumns<SkillProficiencyListRow>({
        canManage,
        characterNameById: canManage ? characterNameById : undefined,
        onToggleAllowedInCampaign: handleToggleAllowed,
        customColumns,
        ownedIds,
        hasCampaignSources,
      }),
    [canManage, characterNameById, handleToggleAllowed, customColumns, ownedIds, hasCampaignSources],
  );

  const filters = useMemo(
    () =>
      buildCampaignContentFilters<SkillProficiencyListRow>({
        canManage,
        onToggleAllowedInCampaign: handleToggleAllowed,
        customFilters,
        ownedIds,
        hasCampaignSources,
      }),
    [canManage, handleToggleAllowed, customFilters, ownedIds, hasCampaignSources],
  );

  if (controller.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {validationBlocked && (
        validationBlocked.blockingEntities.length > 0 ? (
          <ValidationBlockedAlert
            contentType="skill proficiency"
            mode="disallow"
            blockingEntities={validationBlocked.blockingEntities}
            onClose={() => setValidationBlocked(null)}
          />
        ) : (
          <AppAlert
            tone="warning"
            onClose={() => setValidationBlocked(null)}
          >
            {validationBlocked.message ?? 'Cannot disable this skill proficiency.'}
          </AppAlert>
        )
      )}
      <ContentTypeListPage<SkillProficiencyListRow>
        typeLabel="Skill Proficiency"
        typeLabelPlural="Skill Proficiencies"
        headline="Skill Proficiencies"
        breadcrumbData={breadcrumbs}
        canManage={canManage}
        onAdd={controller.onAdd}
        addButtonLabel="Add Skill Proficiency"
        rows={items}
        columns={columns}
        filters={filters}
        getRowId={(r) => r.id}
        getDetailLink={controller.getDetailLink}
        getRowClassName={
          canManage
            ? (params: GridRowClassNameParams) =>
                (params.row as SkillProficiencyListRow).allowedInCampaign === false
                  ? 'AppDataGrid-row--disabled'
                  : ''
            : undefined
        }
        loading={controller.loading}
        error={controller.error}
        searchPlaceholder="Search skills…"
        emptyMessage="No skill proficiencies found."
        density="compact"
        height={560}
      />
    </Stack>
  );
}
