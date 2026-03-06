import { useEffect } from 'react';

export function useCampaignEntryFormReset<TEntry, TForm>(
  entry: TEntry | null,
  isCampaign: boolean,
  reset: (values: TForm) => void,
  toFormValues: (entry: TEntry) => TForm
) {
  useEffect(() => {
    if (!entry || !isCampaign) return;
    reset(toFormValues(entry));
  }, [entry, isCampaign, reset, toFormValues]);
}
