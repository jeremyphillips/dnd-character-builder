import type { Request, Response } from 'express';
import * as skillProficienciesService from '../services/skillProficiencies.service';
import { canViewContent } from '../../../../../shared/domain/capabilities';

export async function listCampaignSkillProficiencies(req: Request, res: Response) {
  const { id: campaignId } = req.params;
  const all = await skillProficienciesService.listByCampaign(campaignId);

  const ctx = req.viewerContext!;
  const items = all.filter((item) => canViewContent(ctx, item.accessPolicy));

  res.json({ skillProficiencies: items });
}

export async function getCampaignSkillProficiency(req: Request, res: Response) {
  const { id: campaignId, skillProficiencyId } = req.params;
  const item = await skillProficienciesService.getById(campaignId, skillProficiencyId);
  if (!item) {
    res.status(404).json({ error: 'Campaign skill proficiency not found' });
    return;
  }

  if (!canViewContent(req.viewerContext!, item.accessPolicy)) {
    res.status(404).json({ error: 'Campaign skill proficiency not found' });
    return;
  }

  res.json({ skillProficiency: item });
}

export async function createCampaignSkillProficiency(req: Request, res: Response) {
  const { id: campaignId } = req.params;
  const result = await skillProficienciesService.create(campaignId, req.body);
  if ('errors' in result) {
    res.status(400).json({ errors: result.errors });
    return;
  }
  res.status(201).json({ skillProficiency: result.skillProficiency });
}

export async function updateCampaignSkillProficiency(req: Request, res: Response) {
  const { id: campaignId, skillProficiencyId } = req.params;
  const result = await skillProficienciesService.update(campaignId, skillProficiencyId, req.body);
  if (!result) {
    res.status(404).json({ error: 'Campaign skill proficiency not found' });
    return;
  }
  if ('errors' in result) {
    res.status(400).json({ errors: result.errors });
    return;
  }
  res.json({ skillProficiency: result.skillProficiency });
}

export async function deleteCampaignSkillProficiency(req: Request, res: Response) {
  const { id: campaignId, skillProficiencyId } = req.params;
  const deleted = await skillProficienciesService.remove(campaignId, skillProficiencyId);
  if (!deleted) {
    res.status(404).json({ error: 'Campaign skill proficiency not found' });
    return;
  }
  res.json({ ok: true });
}
