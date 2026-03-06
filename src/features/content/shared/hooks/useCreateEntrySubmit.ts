import { useCallback } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ValidationError } from './editRoute.types';

export function useCreateEntrySubmit<TFormValues, TInput, TCreated>(params: {
  campaignId: string | null | undefined;
  navigate: NavigateFunction;
  createEntry: (campaignId: string, input: TInput) => Promise<TCreated>;
  toInput: (values: TFormValues) => TInput;
  getSuccessPath: (campaignId: string, created: TCreated) => string;
  setSaving: (value: boolean) => void;
  setErrors: (value: ValidationError[]) => void;
}) {
  const {
    campaignId,
    navigate,
    createEntry,
    toInput,
    getSuccessPath,
    setSaving,
    setErrors,
  } = params;

  return useCallback(
    async (values: TFormValues) => {
      if (!campaignId) return;
      setSaving(true);
      setErrors([]);

      const input = toInput(values);

      try {
        const created = await createEntry(campaignId, input);
        navigate(getSuccessPath(campaignId, created), { replace: true });
      } catch (err) {
        setErrors([
          { path: '', code: 'SAVE_FAILED', message: (err as Error).message },
        ]);
      } finally {
        setSaving(false);
      }
    },
    [
      campaignId,
      navigate,
      createEntry,
      toInput,
      getSuccessPath,
      setSaving,
      setErrors,
    ]
  );
}
