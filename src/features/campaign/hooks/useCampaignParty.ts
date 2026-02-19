import { useEffect, useState } from "react";
import { apiFetch } from "@/app/api";
import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider'
import type { PartyMember } from "@/domain/party";
import type { PartyMemberApiRow } from "@/domain/party";

export function useCampaignParty(status: string = 'approved') {
  const { campaignId } = useActiveCampaign();

  const [party, setParty] = useState<PartyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) {
      setParty([]);
      setLoading(false);
      return;
    }

    // Abort stale request on cleanup (prevents duplicate fetches in StrictMode)
    const controller = new AbortController();

    setLoading(true);

    // TODO: have api filter by status
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    apiFetch<{ characters?: PartyMemberApiRow[] }>(
      `/api/campaigns/${campaignId}/party?status='approved'`, //?${params.toString()
      { signal: controller.signal }
    )
      .then((data) => {
        // Guard: on fast localhost the response may arrive before StrictMode's
        // cleanup abort fires, so check the signal before applying state.
        if (controller.signal.aborted) return;

        const rows = data.characters ?? [];

        const mapped = rows.map((c) => ({
          _id: c._id,
          name: c.name ?? "Unnamed",
          race: c.race ?? "—",
          class: c.class ?? "—",
          level: c.level ?? 1,
          imageKey: c.imageKey ?? null,
          ownerName: c.ownerName ?? "Unknown",
          ownerAvatarUrl: c.ownerAvatarUrl,
          status: c.status ?? "approved",
          campaignMemberId: c.campaignMemberId,
        }));

        setParty(mapped);
      })
      .catch(() => {
        if (!controller.signal.aborted) setParty([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [campaignId, status]);

  return { party, loading };
}
