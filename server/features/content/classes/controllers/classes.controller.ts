import type { Request, Response } from 'express';
import * as classesService from '../services/classes.service';
import { canViewContent } from '../../../../../shared/domain/capabilities';

export async function listCampaignClasses(req: Request, res: Response) {
  const { id: campaignId } = req.params;
  const allClasses = await classesService.listByCampaign(campaignId);

  const ctx = req.viewerContext!;
  const classes = allClasses.filter((c) => canViewContent(ctx, c.accessPolicy));

  res.json({ classes });
}

export async function getCampaignClass(req: Request, res: Response) {
  const { id: campaignId, classId } = req.params;
  const classItem = await classesService.getById(campaignId, classId);
  if (!classItem) {
    res.status(404).json({ error: 'Campaign class not found' });
    return;
  }

  if (!canViewContent(req.viewerContext!, classItem.accessPolicy)) {
    res.status(404).json({ error: 'Campaign class not found' });
    return;
  }

  res.json({ class: classItem });
}

export async function createCampaignClass(req: Request, res: Response) {
  const { id: campaignId } = req.params;
  const result = await classesService.create(campaignId, req.body);
  if ('errors' in result) {
    res.status(400).json({ errors: result.errors });
    return;
  }
  res.status(201).json({ class: result.class });
}

export async function updateCampaignClass(req: Request, res: Response) {
  const { id: campaignId, classId } = req.params;
  const result = await classesService.update(campaignId, classId, req.body);
  if (!result) {
    res.status(404).json({ error: 'Campaign class not found' });
    return;
  }
  if ('errors' in result) {
    res.status(400).json({ errors: result.errors });
    return;
  }
  res.json({ class: result.class });
}

export async function deleteCampaignClass(req: Request, res: Response) {
  const { id: campaignId, classId } = req.params;
  const deleted = await classesService.remove(campaignId, classId);
  if (!deleted) {
    res.status(404).json({ error: 'Campaign class not found' });
    return;
  }
  res.json({ ok: true });
}
