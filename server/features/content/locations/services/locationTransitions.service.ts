import { CampaignLocationTransition } from '../../../../shared/models/CampaignLocationTransition.model';

export type LocationTransitionDoc = {
  id: string;
  campaignId: string;
  from: { mapId: string; cellId: string };
  to: {
    locationId: string;
    mapId?: string;
    targetCellId?: string;
    spawnCellId?: string;
  };
  kind: 'enter' | 'exit' | 'door' | 'stairs' | 'portal' | 'zoom';
  label?: string;
  traversal?: {
    bidirectional?: boolean;
    locked?: boolean;
    dc?: number;
    keyItemId?: string;
  };
  createdAt: string;
  updatedAt: string;
};

type ValidationError = {
  path: string;
  code: string;
  message: string;
};

function toDoc(doc: Record<string, unknown>): LocationTransitionDoc {
  return {
    id: doc.transitionId as string,
    campaignId: doc.campaignId as string,
    from: {
      mapId: doc.fromMapId as string,
      cellId: doc.fromCellId as string,
    },
    to: {
      locationId: doc.toLocationId as string,
      mapId: doc.toMapId as string | undefined,
      targetCellId: doc.toTargetCellId as string | undefined,
      spawnCellId: doc.toSpawnCellId as string | undefined,
    },
    kind: doc.kind as LocationTransitionDoc['kind'],
    label: doc.label as string | undefined,
    traversal: doc.traversal as LocationTransitionDoc['traversal'],
    createdAt: String(doc.createdAt),
    updatedAt: String(doc.updatedAt),
  };
}

const VALID_KINDS = ['enter', 'exit', 'door', 'stairs', 'portal', 'zoom'] as const;

function getFromCellId(body: Record<string, unknown>): string | undefined {
  if (typeof body.fromCellId === 'string' && body.fromCellId.trim().length > 0) {
    return body.fromCellId.trim();
  }
  const from = body.from as Record<string, unknown> | undefined;
  if (from && typeof from.cellId === 'string' && from.cellId.trim().length > 0) {
    return from.cellId.trim();
  }
  return undefined;
}

function validateCreate(body: Record<string, unknown>, fromMapId: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const cellId = getFromCellId(body);
  if (!cellId) {
    errors.push({ path: 'from.cellId', code: 'REQUIRED', message: 'from.cellId is required' });
  }
  if (!body.to || typeof body.to !== 'object') {
    errors.push({ path: 'to', code: 'REQUIRED', message: 'to is required' });
    return errors;
  }
  const to = body.to as Record<string, unknown>;
  if (typeof to.locationId !== 'string' || to.locationId.trim().length === 0) {
    errors.push({ path: 'to.locationId', code: 'REQUIRED', message: 'to.locationId is required' });
  }
  if (typeof body.kind !== 'string' || !VALID_KINDS.includes(body.kind as (typeof VALID_KINDS)[number])) {
    errors.push({
      path: 'kind',
      code: 'INVALID',
      message: `kind must be one of: ${VALID_KINDS.join(', ')}`,
    });
  }
  const from = body.from as Record<string, unknown> | undefined;
  if (from && from.mapId !== undefined && from.mapId !== fromMapId) {
    errors.push({ path: 'from.mapId', code: 'INVALID', message: 'from.mapId must match the route map id' });
  }
  return errors;
}

function generateTransitionId(): string {
  return `tr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function listTransitionsForMap(campaignId: string, mapId: string): Promise<LocationTransitionDoc[]> {
  const docs = await CampaignLocationTransition.find({ campaignId, fromMapId: mapId }).sort({ createdAt: 1 }).lean();
  return docs.map((d) => toDoc(d as Record<string, unknown>));
}

export async function getLocationTransitionById(
  campaignId: string,
  transitionId: string,
): Promise<LocationTransitionDoc | null> {
  const doc = await CampaignLocationTransition.findOne({ campaignId, transitionId }).lean();
  return doc ? toDoc(doc as Record<string, unknown>) : null;
}

export async function createLocationTransition(
  campaignId: string,
  fromMapId: string,
  body: Record<string, unknown>,
): Promise<{ transition: LocationTransitionDoc } | { errors: ValidationError[] }> {
  const errors = validateCreate(body, fromMapId);
  if (errors.length > 0) return { errors };

  const fromCellId = getFromCellId(body)!;
  const to = body.to as Record<string, unknown>;
  const transitionId =
    (body.transitionId as string | undefined)?.trim() ||
    (body.id as string | undefined)?.trim() ||
    generateTransitionId();

  const existing = await CampaignLocationTransition.findOne({ campaignId, transitionId }).lean();
  if (existing) {
    return {
      errors: [
        {
          path: 'transitionId',
          code: 'DUPLICATE',
          message: `A transition with id "${transitionId}" already exists in this campaign`,
        },
      ],
    };
  }

  await CampaignLocationTransition.create({
    campaignId,
    transitionId,
    fromMapId,
    fromCellId,
    toLocationId: to.locationId as string,
    toMapId: to.mapId as string | undefined,
    toTargetCellId: to.targetCellId as string | undefined,
    toSpawnCellId: to.spawnCellId as string | undefined,
    kind: body.kind as LocationTransitionDoc['kind'],
    label: body.label as string | undefined,
    traversal: body.traversal as Record<string, unknown> | undefined,
  });

  const fresh = await CampaignLocationTransition.findOne({ campaignId, transitionId }).lean();
  if (!fresh) {
    return { errors: [{ path: 'transitionId', code: 'INTERNAL', message: 'Failed to load transition after create' }] };
  }
  return { transition: toDoc(fresh as Record<string, unknown>) };
}

export async function updateLocationTransition(
  campaignId: string,
  transitionId: string,
  body: Record<string, unknown>,
): Promise<{ transition: LocationTransitionDoc } | { errors: ValidationError[] } | null> {
  const $set: Record<string, unknown> = {};

  if (body.fromCellId !== undefined) $set.fromCellId = (body.fromCellId as string).trim();
  if (body.fromMapId !== undefined) $set.fromMapId = body.fromMapId;
  if (body.to !== undefined) {
    const to = body.to as Record<string, unknown>;
    if (to.locationId !== undefined) $set.toLocationId = to.locationId;
    if (to.mapId !== undefined) $set.toMapId = to.mapId;
    if (to.targetCellId !== undefined) $set.toTargetCellId = to.targetCellId;
    if (to.spawnCellId !== undefined) $set.toSpawnCellId = to.spawnCellId;
  }
  if (body.kind !== undefined) $set.kind = body.kind;
  if (body.label !== undefined) $set.label = body.label;
  if (body.traversal !== undefined) $set.traversal = body.traversal;

  if (Object.keys($set).length === 0) {
    const existing = await CampaignLocationTransition.findOne({ campaignId, transitionId }).lean();
    return existing ? { transition: toDoc(existing as Record<string, unknown>) } : null;
  }

  const doc = await CampaignLocationTransition.findOneAndUpdate(
    { campaignId, transitionId },
    { $set },
    { new: true, lean: true },
  );
  return doc ? { transition: toDoc(doc as Record<string, unknown>) } : null;
}

export async function deleteLocationTransition(campaignId: string, transitionId: string): Promise<boolean> {
  const result = await CampaignLocationTransition.deleteOne({ campaignId, transitionId });
  return result.deletedCount > 0;
}
