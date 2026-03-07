import type { Request, Response } from 'express';
import * as spellsService from '../services/spells.service';
import { canViewContent } from '../../../../../shared/domain/capabilities';

export async function listCampaignSpells(req: Request, res: Response) {
  const { id: campaignId } = req.params;
  const all = await spellsService.listByCampaign(campaignId);

  const ctx = req.viewerContext!;
  const items = all.filter((item) => canViewContent(ctx, item.accessPolicy));

  res.json({ spells: items });
}

export async function getCampaignSpell(req: Request, res: Response) {
  const { id: campaignId, spellId } = req.params;
  const item = await spellsService.getById(campaignId, spellId);
  if (!item) {
    res.status(404).json({ error: 'Campaign spell not found' });
    return;
  }

  if (!canViewContent(req.viewerContext!, item.accessPolicy)) {
    res.status(404).json({ error: 'Campaign spell not found' });
    return;
  }

  res.json({ spell: item });
}

export async function createCampaignSpell(req: Request, res: Response) {
  const { id: campaignId } = req.params;
  const result = await spellsService.create(campaignId, req.body);
  if ('errors' in result) {
    res.status(400).json({ errors: result.errors });
    return;
  }
  res.status(201).json({ spell: result.spell });
}

export async function updateCampaignSpell(req: Request, res: Response) {
  const { id: campaignId, spellId } = req.params;
  const result = await spellsService.update(campaignId, spellId, req.body);
  if (!result) {
    res.status(404).json({ error: 'Campaign spell not found' });
    return;
  }
  if ('errors' in result) {
    res.status(400).json({ errors: result.errors });
    return;
  }
  res.json({ spell: result.spell });
}

export async function deleteCampaignSpell(req: Request, res: Response) {
  const { id: campaignId, spellId } = req.params;
  const deleted = await spellsService.remove(campaignId, spellId);
  if (!deleted) {
    res.status(404).json({ error: 'Campaign spell not found' });
    return;
  }
  res.json({ ok: true });
}
