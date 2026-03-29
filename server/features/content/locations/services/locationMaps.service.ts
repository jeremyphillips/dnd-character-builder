import { CampaignLocationMap } from '../../../../shared/models/CampaignLocationMap.model';
import { CampaignLocationTransition } from '../../../../shared/models/CampaignLocationTransition.model';
import { CampaignLocation } from '../../../../shared/models/CampaignLocation.model';

export type LocationMapDoc = {
  id: string;
  campaignId: string;
  locationId: string;
  name: string;
  kind: 'world-grid' | 'area-grid' | 'encounter-grid';
  grid: { width: number; height: number; cellUnit: string | number };
  isDefault?: boolean;
  cells?: Array<{ cellId: string; x: number; y: number; terrain?: string; label?: string }>;
  createdAt: string;
  updatedAt: string;
};

type ValidationError = {
  path: string;
  code: string;
  message: string;
};

function toDoc(doc: Record<string, unknown>): LocationMapDoc {
  return {
    id: doc.mapId as string,
    campaignId: doc.campaignId as string,
    locationId: doc.locationId as string,
    name: doc.name as string,
    kind: doc.kind as LocationMapDoc['kind'],
    grid: doc.grid as LocationMapDoc['grid'],
    isDefault: doc.isDefault as boolean | undefined,
    cells: doc.cells as LocationMapDoc['cells'],
    createdAt: String(doc.createdAt),
    updatedAt: String(doc.updatedAt),
  };
}

function validateGrid(grid: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!grid || typeof grid !== 'object') {
    errors.push({ path: 'grid', code: 'REQUIRED', message: 'grid is required' });
    return errors;
  }
  const g = grid as Record<string, unknown>;
  if (typeof g.width !== 'number' || g.width <= 0) {
    errors.push({ path: 'grid.width', code: 'INVALID', message: 'grid.width must be a positive number' });
  }
  if (typeof g.height !== 'number' || g.height <= 0) {
    errors.push({ path: 'grid.height', code: 'INVALID', message: 'grid.height must be a positive number' });
  }
  if (g.cellUnit === undefined || g.cellUnit === null) {
    errors.push({ path: 'grid.cellUnit', code: 'REQUIRED', message: 'grid.cellUnit is required' });
  }
  return errors;
}

function validateCreate(body: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push({ path: 'name', code: 'REQUIRED', message: 'name is required' });
  }
  const validKinds = ['world-grid', 'area-grid', 'encounter-grid'];
  if (typeof body.kind !== 'string' || !validKinds.includes(body.kind)) {
    errors.push({
      path: 'kind',
      code: 'INVALID',
      message: `kind must be one of: ${validKinds.join(', ')}`,
    });
  }
  errors.push(...validateGrid(body.grid));
  return errors;
}

function generateMapId(name: string): string {
  return `${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
}

export async function listMapsForLocation(campaignId: string, locationId: string): Promise<LocationMapDoc[]> {
  const docs = await CampaignLocationMap.find({ campaignId, locationId }).sort({ name: 1 }).lean();
  return docs.map((d) => toDoc(d as Record<string, unknown>));
}

export async function getLocationMapById(campaignId: string, mapId: string): Promise<LocationMapDoc | null> {
  const doc = await CampaignLocationMap.findOne({ campaignId, mapId }).lean();
  return doc ? toDoc(doc as Record<string, unknown>) : null;
}

export async function createLocationMap(
  campaignId: string,
  locationId: string,
  body: Record<string, unknown>,
): Promise<{ map: LocationMapDoc } | { errors: ValidationError[] }> {
  const errors = validateCreate(body);
  if (errors.length > 0) return { errors };

  const loc = await CampaignLocation.findOne({ campaignId, locationId }).lean();
  if (!loc) {
    return { errors: [{ path: 'locationId', code: 'NOT_FOUND', message: 'Location not found' }] };
  }

  const name = (body.name as string).trim();
  const mapId =
    (body.mapId as string | undefined)?.trim() ||
    (body.id as string | undefined)?.trim() ||
    generateMapId(name);

  const existing = await CampaignLocationMap.findOne({ campaignId, mapId }).lean();
  if (existing) {
    return {
      errors: [
        {
          path: 'mapId',
          code: 'DUPLICATE',
          message: `A map with id "${mapId}" already exists in this campaign`,
        },
      ],
    };
  }

  await CampaignLocationMap.create({
    campaignId,
    locationId,
    mapId,
    name,
    kind: body.kind as LocationMapDoc['kind'],
    grid: body.grid as LocationMapDoc['grid'],
    isDefault: body.isDefault as boolean | undefined,
    cells: body.cells as unknown[] | undefined,
  });

  const fresh = await CampaignLocationMap.findOne({ campaignId, mapId }).lean();
  if (!fresh) {
    return { errors: [{ path: 'mapId', code: 'INTERNAL', message: 'Failed to load map after create' }] };
  }
  return { map: toDoc(fresh as Record<string, unknown>) };
}

export async function updateLocationMap(
  campaignId: string,
  mapId: string,
  body: Record<string, unknown>,
): Promise<{ map: LocationMapDoc } | { errors: ValidationError[] } | null> {
  const $set: Record<string, unknown> = {};
  if (body.name !== undefined) $set.name = (body.name as string).trim();
  if (body.kind !== undefined) $set.kind = body.kind;
  if (body.grid !== undefined) {
    const gErr = validateGrid(body.grid);
    if (gErr.length > 0) return { errors: gErr };
    $set.grid = body.grid;
  }
  if (body.isDefault !== undefined) $set.isDefault = body.isDefault;
  if (body.cells !== undefined) $set.cells = body.cells;

  if (Object.keys($set).length === 0) {
    const existing = await CampaignLocationMap.findOne({ campaignId, mapId }).lean();
    return existing ? { map: toDoc(existing as Record<string, unknown>) } : null;
  }

  const doc = await CampaignLocationMap.findOneAndUpdate({ campaignId, mapId }, { $set }, { new: true, lean: true });
  return doc ? { map: toDoc(doc as Record<string, unknown>) } : null;
}

export async function deleteLocationMap(campaignId: string, mapId: string): Promise<boolean> {
  await CampaignLocationTransition.deleteMany({ campaignId, fromMapId: mapId });
  await CampaignLocationTransition.deleteMany({ campaignId, toMapId: mapId });
  const result = await CampaignLocationMap.deleteOne({ campaignId, mapId });
  return result.deletedCount > 0;
}
