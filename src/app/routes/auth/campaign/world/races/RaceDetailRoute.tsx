import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider';
import { ContentDetailScaffold } from '@/features/content/components';
import { raceRepo } from '@/features/content/domain/repo';
import type { Race } from '@/features/content/domain/types';
import { useCampaignContentEntry } from '@/features/content/hooks/useCampaignContentEntry';
import { useBreadcrumbs } from '@/hooks';
import { toViewerContext, canManageCampaignContent } from '@/shared/domain/capabilities';
import { AppBadge } from '@/ui/badges/AppBadge/AppBadge';
import { KeyValueSection } from '@/ui/components/content';
import { VisibilityChip } from '@/ui/components/fields';

export default function RaceDetailRoute() {
  const { campaignId, campaign } = useActiveCampaign();
  const { raceId } = useParams<{ raceId: string }>();
  const breadcrumbs = useBreadcrumbs();

  const ctx = toViewerContext(campaign?.viewer);
  const canManage = canManageCampaignContent(ctx);

  const { entry: race, loading, error, notFound } = useCampaignContentEntry<Race>({
    campaignId: campaignId ?? undefined,
    entryId: raceId,
    fetchEntry: raceRepo.getEntry,
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || notFound || !race) {
    return <Alert severity="error">{error ?? 'Race not found.'}</Alert>;
  }

  const listPath = `/campaigns/${campaignId}/world/races`;
  const editPath = `${listPath}/${raceId}/edit`;
  const canEdit = canManage && race.source === 'campaign';

  return (
    <ContentDetailScaffold
      title={race.name}
      breadcrumbData={breadcrumbs}
      listPath={listPath}
      editPath={editPath}
      canEdit={canEdit}
      source={race.source}
      accessPolicy={race.accessPolicy}
    >
      {race.description && (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {race.description}
        </Typography>
      )}

      <KeyValueSection
        title="Details"
        items={[
          {
            label: 'Source',
            value: (
              <AppBadge
                label={race.source}
                tone={race.source === 'system' ? 'info' : 'default'}
              />
            ),
          },
          {
            label: 'Visibility',
            value:
              race.accessPolicy && race.accessPolicy.scope !== 'public' ? (
                <VisibilityChip visibility={race.accessPolicy} />
              ) : (
                'Public'
              ),
          },
        ]}
        columns={2}
        sx={{ mt: 3 }}
      />
    </ContentDetailScaffold>
  );
}
