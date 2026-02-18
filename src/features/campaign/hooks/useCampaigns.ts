import { useEffect, useState } from "react";
import { apiFetch } from "@/app/api";
import type { Campaign } from "@/shared/types/campaign.types";
import { ApiError } from "@/app/api"
import type { CampaignFormData } from "@/features/campaign/components/CampaignForm";

export function useCampaigns(filters?: {
  campaignId?: string
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("useCampaigns render");
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    const params = new URLSearchParams()

    if (filters?.campaignId) params.append("campaignId", filters.campaignId);

    try {
      const data = await apiFetch<{ campaigns: Campaign[] }>(`/api/campaigns?${params.toString()}`);
      setCampaigns(data.campaigns ?? []);
    } catch (err) {
      setError("Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  async function createCampaign(data: CampaignFormData) {
    try {
      setCreating(true);
      await apiFetch("/api/campaigns", {
        method: "POST",
        body: data,
      });

      await fetchCampaigns(); // refresh list
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to create campaign"
      );
      throw err; // allow UI to react if needed
    } finally {
      setCreating(false);
    }
  }

  return {
    campaigns,
    loading,
    creating,
    error,
    createCampaign,
    refetch: fetchCampaigns,
  };
}
