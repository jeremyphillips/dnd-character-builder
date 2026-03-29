/**
 * Location form configs for ConditionalFormRenderer.
 */
import type { FieldConfig } from '@/ui/patterns';
import { buildDefaultValues, DEFAULT_VISIBILITY_PUBLIC } from '@/ui/patterns';
import { buildFieldConfigs } from '@/features/content/shared/forms/registry';
import { LOCATION_FORM_FIELDS } from '../registry/locationForm.registry';
import type { LocationFormValues } from '../types/locationForm.types';

export type GetLocationFieldConfigsOptions = {
  policyCharacters?: { id: string; name: string }[];
};

export const getLocationFieldConfigs = (
  options: GetLocationFieldConfigsOptions = {},
): FieldConfig[] => buildFieldConfigs(LOCATION_FORM_FIELDS, options);

export const LOCATION_FORM_DEFAULTS: LocationFormValues = buildDefaultValues<LocationFormValues>(
  getLocationFieldConfigs(),
  { accessPolicy: DEFAULT_VISIBILITY_PUBLIC },
);
