import { useEffect, useState } from "react";
import { apiFetch } from "@/app/api";
import type { Campaign } from "@/shared/types/campaign.types";
import { ApiError } from "@/app/api"
import type { CampaignFormData } from "@/features/campaign/components/CampaignForm";

export function useEquipment() {
  const [equipment, setEquipment] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  async function fetchEquipment() {
    try {
      const data = await apiFetch<{ equipment: Campaign[] }>("/api/campaigns");
      setEquipment(data.equipment ?? []);
    } catch (err) {
      setError("Failed to load equipment");
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }

  async function createEquipment(data: CampaignFormData) {
    try {
      setCreating(true);
      await apiFetch("/api/campaigns", {
        method: "POST",
        body: data,
      });

      await fetchEquipment(); // refresh list
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
    equipment,
    loading,
    creating,
    error,
    createEquipment,
    refetch: fetchEquipment,
  };
}
