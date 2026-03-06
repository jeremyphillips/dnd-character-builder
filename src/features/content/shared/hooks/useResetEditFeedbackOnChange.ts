import { useEffect } from 'react';

export function useResetEditFeedbackOnChange(
  watch: (callback: () => void) => () => void,
  clearFeedback: () => void
) {
  useEffect(() => {
    const sub = watch(() => clearFeedback());
    return () => sub.unsubscribe();
  }, [watch, clearFeedback]);
}
