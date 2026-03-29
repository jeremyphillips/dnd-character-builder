import { CampaignLocation } from '../../../../shared/models/CampaignLocation.model';
import { CampaignLocationMap } from '../../../../shared/models/CampaignLocationMap.model';
import { CampaignLocationTransition } from '../../../../shared/models/CampaignLocationTransition.model';
import type { AccessPolicy } from '../../../../../shared/domain/accessPolicy';

export type LocationDoc = {
  id: string;
  campaignId: string;
  name: string;
  scale: string;
  category?: string;
  description?: string;
  imageKey?: string;
  accessPolicy?: AccessPolicy;
  parentId?: string;
  ancestorIds: string[];
  sortOrder?: number;
  label?: { short?: string; number?: string };
  aliases?: string[];
  tags?: string[];
  connections?: Array<{
    toId: string;
    kind: 'road' | 'river' | 'door' | 'stairs' | 'hall' | 'secret' | 'portal';
    bidirectional?: boolean;
    locked?: boolean;
    dc?: number;
    keyItemId?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type ValidationError = {
  path: string;
  code: string;
  message: string;
};

function toDoc(doc: Record<string, unknown>): LocationDoc {
  return {
    id: doc.locationId as string,
    campaignId: doc.campaignId as string,
    name: doc.name as string,
    scale: doc.scale as string,
    category: doc.category as string | undefined,
    description: doc.description as string | undefined,
    imageKey: doc.imageKey as string | undefined,
    accessPolicy: doc.accessPolicy as AccessPolicy | undefined,
    parentId: doc.parentId as string | undefined,
    ancestorIds: (doc.ancestorIds as string[]) ?? [],
    sortOrder: doc.sortOrder as number | undefined,
    label: doc.label as LocationDoc['label'],
    aliases: doc.aliases as string[] | undefined,
    tags: doc.tags as string[] | undefined,
    connections: doc.connections as LocationDoc['connections'],
    createdAt: String(doc.createdAt),
    updatedAt: String(doc.updatedAt),
  };
}

function generateLocationId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function computeAncestorIdsForParent(
  campaignId: string,
  parentId: string | undefined,
): Promise<string[]> {
  if (!parentId) return [];
  const parent = await CampaignLocation.findOne({ campaignId, locationId: parentId }).lean();
  if (!parent) {
    return [];
  }
  const parentAncestors = ((parent as Record<string, unknown>).ancestorIds as string[]) ?? [];
  return [...parentAncestors, parentId];
}

async function refreshDescendantAncestorIds(campaignId: string, parentLocationId: string): Promise<void> {
  const children = await CampaignLocation.find({ campaignId, parentId: parentLocationId }).lean();
  for (const raw of children) {
    const child = raw as Record<string, unknown>;
    const childLocationId = child.locationId as string;
    const nextAncestors = await computeAncestorIdsForParent(campaignId, parentLocationId);
    await CampaignLocation.updateOne(
      { campaignId, locationId: childLocationId },
      { $set: { ancestorIds: nextAncestors } },
    );
    await refreshDescendantAncestorIds(campaignId, childLocationId);
  }
}

function validateCreate(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push({ path: 'name', code: 'REQUIRED', message: 'name is required' });
  }
  if (typeof body.scale !== 'string' || body.scale.trim().length === 0) {
    errors.push({ path: 'scale', code: 'REQUIRED', message: 'scale is required' });
  }
  return errors;
}

function validateUpdate(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    errors.push({ path: 'name', code: 'INVALID', message: 'name must be a non-empty string' });
  }
  if (body.scale !== undefined && (typeof body.scale !== 'string' || body.scale.trim().length === 0)) {
    errors.push({ path: 'scale', code: 'INVALID', message: 'scale must be a non-empty string' });
  }
  return errors;
}

export async function listLocationsByCampaign(campaignId: string): Promise<LocationDoc[]> {
  const docs = await CampaignLocation.find({ campaignId }).sort({ sortOrder: 1, name: 1 }).lean();
  return docs.map((d) => toDoc(d as Record<string, unknown>));
}

export async function listChildLocations(campaignId: string, parentId: string): Promise<LocationDoc[]> {
  const docs = await CampaignLocation.find({ campaignId, parentId }).sort({ sortOrder: 1, name: 1 }).lean();
  return docs.map((d) => toDoc(d as Record<string, unknown>));
}

export async function getLocationById(campaignId: string, locationId: string): Promise<LocationDoc | null> {
  const doc = await CampaignLocation.findOne({ campaignId, locationId }).lean();
  return doc ? toDoc(doc as Record<string, unknown>) : null;
}

export async function createLocation(
  campaignId: string,
  body: Record<string, unknown>,
): Promise<{ location: LocationDoc } | { errors: ValidationError[] }> {
  const errors = validateCreate(body);
  if (errors.length > 0) return { errors };

  const name = (body.name as string).trim();
  const scale = (body.scale as string).trim();
  const locationId =
    (body.locationId as string | undefined)?.trim() ||
    (body.id as string | undefined)?.trim() ||
    generateLocationId(name);

  const parentId = body.parentId as string | undefined;
  if (parentId) {
    const parent = await CampaignLocation.findOne({ campaignId, locationId: parentId }).lean();
    if (!parent) {
      return { errors: [{ path: 'parentId', code: 'NOT_FOUND', message: 'Parent location not found' }] };
    }
  }

  const ancestorIds = await computeAncestorIdsForParent(campaignId, parentId);

  const existing = await CampaignLocation.findOne({ campaignId, locationId }).lean();
  if (existing) {
    return {
      errors: [
        {
          path: 'locationId',
          code: 'DUPLICATE',
          message: `A location with id "${locationId}" already exists in this campaign`,
        },
      ],
    };
  }

  const accessPolicy = body.accessPolicy as AccessPolicy | undefined;

  const doc = await CampaignLocation.create({
    campaignId,
    locationId,
    name,
    scale,
    category: body.category as string | undefined,
    description: body.description as string | undefined,
    imageKey: body.imageKey as string | undefined,
    accessPolicy,
    parentId,
    ancestorIds,
    sortOrder: body.sortOrder as number | undefined,
    label: body.label as Record<string, unknown> | undefined,
    aliases: body.aliases as string[] | undefined,
    tags: body.tags as string[] | undefined,
    connections: body.connections as unknown[] | undefined,
  });

  return { location: toDoc(doc.toObject() as Record<string, unknown>) };
}

export async function updateLocation(
  campaignId: string,
  locationId: string,
  body: Record<string, unknown>,
): Promise<{ location: LocationDoc } | { errors: ValidationError[] } | null> {
  const errors = validateUpdate(body);
  if (errors.length > 0) return { errors };

  const existing = await CampaignLocation.findOne({ campaignId, locationId }).lean();
  if (!existing) return null;

  const $set: Record<string, unknown> = {};

  if (body.name !== undefined) $set.name = (body.name as string).trim();
  if (body.scale !== undefined) $set.scale = (body.scale as string).trim();
  if (body.category !== undefined) $set.category = body.category;
  if (body.description !== undefined) $set.description = body.description;
  if (body.imageKey !== undefined) $set.imageKey = body.imageKey;
  if (body.accessPolicy !== undefined) $set.accessPolicy = body.accessPolicy;
  if (body.sortOrder !== undefined) $set.sortOrder = body.sortOrder;
  if (body.label !== undefined) $set.label = body.label;
  if (body.aliases !== undefined) $set.aliases = body.aliases;
  if (body.tags !== undefined) $set.tags = body.tags;
  if (body.connections !== undefined) $set.connections = body.connections;

  if (body.parentId !== undefined) {
    const newParentId = body.parentId as string | undefined;
    if (newParentId === locationId) {
      return { errors: [{ path: 'parentId', code: 'INVALID', message: 'Location cannot be its own parent' }] };
    }
    if (newParentId) {
      const parent = await CampaignLocation.findOne({ campaignId, locationId: newParentId }).lean();
      if (!parent) {
        return { errors: [{ path: 'parentId', code: 'NOT_FOUND', message: 'Parent location not found' }] };
      }
      const parentAncestors = ((parent as Record<string, unknown>).ancestorIds as string[]) ?? [];
      if (parentAncestors.includes(locationId)) {
        return {
          errors: [{ path: 'parentId', code: 'INVALID', message: 'Cannot set parent: would create a cycle' }],
        };
      }
    }
    $set.parentId = newParentId;
    $set.ancestorIds = await computeAncestorIdsForParent(campaignId, newParentId);
  }

  const doc = await CampaignLocation.findOneAndUpdate({ campaignId, locationId }, { $set }, { new: true, lean: true });

  if (!doc) return null;

  if (body.parentId !== undefined) {
    await refreshDescendantAncestorIds(campaignId, locationId);
  }

  const fresh = await CampaignLocation.findOne({ campaignId, locationId }).lean();
  return { location: toDoc((fresh ?? doc) as Record<string, unknown>) };
}

export async function deleteLocation(campaignId: string, locationId: string): Promise<boolean> {
  const childCount = await CampaignLocation.countDocuments({ campaignId, parentId: locationId });
  if (childCount > 0) {
    return false;
  }

  const maps = await CampaignLocationMap.find({ campaignId, locationId }).lean();
  for (const raw of maps) {
    const m = raw as Record<string, unknown>;
    const mapId = m.mapId as string;
    await CampaignLocationTransition.deleteMany({ campaignId, fromMapId: mapId });
    await CampaignLocationTransition.deleteMany({ campaignId, toMapId: mapId });
  }
  await CampaignLocationMap.deleteMany({ campaignId, locationId });

  const result = await CampaignLocation.deleteOne({ campaignId, locationId });
  return result.deletedCount > 0;
}
