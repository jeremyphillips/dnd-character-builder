/**
 * Client-side repository for campaign-owned custom spells.
 *
 * All calls go through the API (DB-backed). System spells come from
 * systemCatalog.spells. Campaign spells are merged at runtime in spellRepo.
 */
import { apiFetch, ApiError } from '@/app/api';
import type { ContentSource } from './types';
import type { Spell, SpellInput } from './types/spell.types';

// ---------------------------------------------------------------------------
// API response shapes
// ---------------------------------------------------------------------------

type CampaignSpellDto = {
  _id: string;
  campaignId: string;
  spellId: string;
  name: string;
  description: string;
  imageKey: string;
  school: string;
  level: number;
  classes: string[];
  ritual: boolean;
  concentration: boolean;
  effects: unknown[];
  accessPolicy?: { scope: string; allowCharacterIds?: string[] };
  createdAt: string;
  updatedAt: string;
};

type ValidationError = {
  path: string;
  code: string;
  message: string;
};

// ---------------------------------------------------------------------------
// DTO → domain
// ---------------------------------------------------------------------------

function toSpell(dto: CampaignSpellDto): Spell {
  return {
    id: dto.spellId,
    name: dto.name,
    description: dto.description,
    imageKey: dto.imageKey || undefined,
    school: dto.school as Spell['school'],
    level: dto.level,
    classes: dto.classes ?? [],
    ritual: dto.ritual,
    concentration: dto.concentration,
    effects: dto.effects as Spell['effects'],
    source: 'campaign' as ContentSource,
    campaignId: dto.campaignId,
    accessPolicy: dto.accessPolicy,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function listCampaignSpells(
  campaignId: string,
): Promise<Spell[]> {
  const data = await apiFetch<{ spells: CampaignSpellDto[] }>(
    `/api/campaigns/${campaignId}/spells`,
  );
  return (data.spells ?? []).map(toSpell);
}

export async function getCampaignSpell(
  campaignId: string,
  spellId: string,
): Promise<Spell | null> {
  try {
    const data = await apiFetch<{ spell: CampaignSpellDto }>(
      `/api/campaigns/${campaignId}/spells/${spellId}`,
    );
    return toSpell(data.spell);
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createCampaignSpell(
  campaignId: string,
  input: SpellInput,
): Promise<{ spell: Spell } | { errors: ValidationError[] }> {
  try {
    const data = await apiFetch<{ spell: CampaignSpellDto }>(
      `/api/campaigns/${campaignId}/spells`,
      { method: 'POST', body: input },
    );
    return { spell: toSpell(data.spell) };
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 400 && err.payload) {
      const payload = err.payload as { errors?: ValidationError[] };
      if (payload.errors) return { errors: payload.errors };
    }
    throw err;
  }
}

export async function updateCampaignSpell(
  campaignId: string,
  spellId: string,
  input: SpellInput,
): Promise<{ spell: Spell } | { errors: ValidationError[] }> {
  try {
    const data = await apiFetch<{ spell: CampaignSpellDto }>(
      `/api/campaigns/${campaignId}/spells/${spellId}`,
      { method: 'PATCH', body: input },
    );
    return { spell: toSpell(data.spell) };
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 400 && err.payload) {
      const payload = err.payload as { errors?: ValidationError[] };
      if (payload.errors) return { errors: payload.errors };
    }
    throw err;
  }
}

export async function deleteCampaignSpell(
  campaignId: string,
  spellId: string,
): Promise<boolean> {
  try {
    await apiFetch(
      `/api/campaigns/${campaignId}/spells/${spellId}`,
      { method: 'DELETE' },
    );
    return true;
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 404) return false;
    throw err;
  }
}
