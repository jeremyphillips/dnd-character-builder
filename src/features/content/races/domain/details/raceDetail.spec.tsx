import type { Race } from '@/features/content/races/domain/types';
import { formatCreatureSenseList } from '@/features/content/shared/domain/vocab/creatureSenses.format';
import { contentDetailMetaSpecs, contentDetailPatchedMetaSpecs } from '@/features/content/shared/domain';
import type { DetailSpec } from '@/features/content/shared/forms/registry';

export type RaceDetailCtx = Record<string, never>;

function raceAdvancedRecord(race: Race): Record<string, unknown> {
  const scopeMeta: Record<string, unknown> =
    race.source === 'system'
      ? { systemId: (race as Race & { systemId?: string }).systemId }
      : { campaignId: (race as Race & { campaignId?: string }).campaignId };

  return {
    id: race.id,
    name: race.name,
    source: race.source,
    patched: race.patched,
    ...scopeMeta,
    accessPolicy: race.accessPolicy,
    description: race.description,
    imageKey: race.imageKey,
    campaigns: race.campaigns,
  };
}

export const RACE_DETAIL_SPECS: DetailSpec<Race, RaceDetailCtx>[] = [
  ...contentDetailMetaSpecs<Race, RaceDetailCtx>(),
  ...contentDetailPatchedMetaSpecs<Race, RaceDetailCtx>(),
  {
    key: 'description',
    label: 'Description',
    order: 40,
    hidden: (race) => !race.description?.trim(),
    render: (race) => (
      <span style={{ whiteSpace: 'pre-line' }}>{race.description}</span>
    ),
  },
  {
    key: 'campaigns',
    label: 'Campaigns',
    order: 45,
    hidden: (race) => !race.campaigns?.length,
    render: (race) => race.campaigns?.join(', ') ?? '—',
  },
  {
    key: 'senseGrants',
    label: 'Senses',
    order: 48,
    hidden: (race) => !race.grants?.senses?.length,
    render: (race) => (
      <span style={{ whiteSpace: 'pre-line' }}>{formatCreatureSenseList(race.grants?.senses)}</span>
    ),
  },
  {
    key: 'raceRawRecord',
    label: 'Full record (JSON)',
    order: 2000,
    placement: 'advanced',
    rawAudience: 'platformOwner',
    getValue: (race) => raceAdvancedRecord(race),
  },
];
