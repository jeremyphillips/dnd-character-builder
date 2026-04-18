import { useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider';
import { useActiveCampaignCanManageContent } from '@/app/providers/useActiveCampaignCanManageContent';
import { useActiveCampaignViewerContext } from '@/app/providers/useActiveCampaignViewerContext';
import {
  ContentDetailImageKeyValueGrid,
  ContentDetailMetaRow,
  ContentDetailScaffold,
} from '@/features/content/shared/components';
import { classRepo, type ClassContentItem } from '@/features/content/classes/domain';
import { useCampaignContentEntry } from '@/features/content/shared/hooks/useCampaignContentEntry';
import { useBreadcrumbs } from '@/app/navigation';
import { AppAlert } from '@/ui/primitives';
import { KeyValueSection } from '@/ui/patterns';
import {
  buildContentDetailSectionsFromSpecs,
  toDetailSpecViewer,
} from '@/features/content/shared/forms/registry';
import { CLASS_DETAIL_SPECS } from '@/features/content/classes/domain/forms';

export default function ClassDetailRoute() {
  const { campaignId } = useActiveCampaign();
  const canManage = useActiveCampaignCanManageContent();
  const viewerContext = useActiveCampaignViewerContext();
  const { classId } = useParams<{ classId: string }>();
  const breadcrumbs = useBreadcrumbs();

  const { entry: charClass, loading, error, notFound } = useCampaignContentEntry<ClassContentItem>({
    campaignId: campaignId ?? undefined,
    entryId: classId,
    fetchEntry: classRepo.getEntry,
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || notFound || !charClass) {
    return <AppAlert tone="danger">{error ?? 'Class not found.'}</AppAlert>;
  }

  const editPath = `/campaigns/${campaignId}/world/classes/${classId}/edit`;

  const viewer = toDetailSpecViewer(viewerContext);
  const { metaItems, mainItems, advancedItems } = buildContentDetailSectionsFromSpecs({
    specs: CLASS_DETAIL_SPECS,
    item: charClass,
    ctx: {},
    viewer,
  });

  const showAdvancedSection = Boolean(viewer?.isPlatformAdmin) && advancedItems.length > 0;

  const source = charClass.source ?? 'system';

  return (
    <ContentDetailScaffold
      title={charClass.name}
      breadcrumbData={breadcrumbs}
      editPath={editPath}
      canManage={canManage}
      source={source}
      accessPolicy={charClass.accessPolicy}
      hideAccessPolicyBadge
    >
      <ContentDetailMetaRow items={metaItems} />

      <ContentDetailImageKeyValueGrid
        imageContentType="class"
        imageKey={charClass.imageKey}
        alt={charClass.name}
      >
        <KeyValueSection title="" items={mainItems} columns={2} />
      </ContentDetailImageKeyValueGrid>

      {showAdvancedSection ? (
        <Accordion
          defaultExpanded={false}
          disableGutters
          sx={{ mt: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="class-advanced-content"
            id="class-advanced-header"
          >
            <Typography component="span" variant="subtitle1" fontWeight={600}>
              Advanced
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <KeyValueSection title="Advanced class data" items={advancedItems} columns={1} dense />
          </AccordionDetails>
        </Accordion>
      ) : null}
    </ContentDetailScaffold>
  );
}
