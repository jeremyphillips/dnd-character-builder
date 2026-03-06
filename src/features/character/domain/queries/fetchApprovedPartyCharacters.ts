/**
 * Fetches approved party characters for a campaign.
 *
 * Centralizes the endpoint for future extension (e.g. NPCs).
 */
import { apiFetch } from '@/app/api';

export async function fetchApprovedPartyCharacters<TCharacter>(
  campaignId: string,
): Promise<TCharacter[]> {
  const data = await apiFetch<{ characters?: TCharacter[] }>(
    `/api/campaigns/${campaignId}/party?status=approved`,
  );

  return data.characters ?? [];
}
