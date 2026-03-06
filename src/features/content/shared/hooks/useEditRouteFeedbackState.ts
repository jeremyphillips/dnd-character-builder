import { useState, useCallback } from 'react';
import type { ValidationError } from './editRoute.types';

export function useEditRouteFeedbackState() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clearFeedback = useCallback(() => {
    setSuccess(false);
    setErrors([]);
  }, []);

  return {
    saving,
    success,
    errors,
    setSaving,
    setSuccess,
    setErrors,
    clearFeedback,
  };
}
