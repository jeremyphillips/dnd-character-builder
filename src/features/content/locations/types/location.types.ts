import type { AccessPolicy } from '@/shared/domain/accessPolicy';

/**
 * User-authored location (normalized). `scale` is required for hierarchy and UI.
 * Use `category` for high-level classification (not `kind`).
 */
export type LocationScale =
  | 'world'
  | 'region'
  | 'subregion'
  | 'city'
  | 'district'
  | 'site'
  | 'building'
  | 'floor'
  | 'room';

export type LocationConnectionKind =
  | 'road'
  | 'river'
  | 'door'
  | 'stairs'
  | 'hall'
  | 'secret'
  | 'portal';

export type LocationConnection = {
  toId: string;
  kind: LocationConnectionKind;
  bidirectional?: boolean;
  locked?: boolean;
  dc?: number;
  keyItemId?: string;
};

export type Location = {
  id: string;
  campaignId: string;
  name: string;
  scale: LocationScale;
  category?: string;
  description?: string;
  imageKey?: string | null;
  accessPolicy?: AccessPolicy;
  parentId?: string;
  ancestorIds?: string[];
  sortOrder?: number;
  label?: { short?: string; number?: string };
  aliases?: string[];
  tags?: string[];
  connections?: LocationConnection[];
};
