/**
 * Converts FieldSpec[] -> FieldConfig[] for AppForm.
 */
import type { FieldConfig } from '@/ui/patterns';
import type { FieldSpec } from './fieldSpec.types';

export type BuildFieldConfigsOptions = {
  policyCharacters?: { id: string; name: string }[];
};

/**
 * Builds FieldConfig[] from FieldSpec[], skipping specs with skipInForm.
 */
export const buildFieldConfigs = <
  FormValues extends Record<string, unknown>,
  InputShape extends Record<string, unknown>,
  ItemShape extends Record<string, unknown>,
>(
  specs: readonly FieldSpec<FormValues, InputShape, ItemShape>[],
  options: BuildFieldConfigsOptions = {}
): FieldConfig[] => {
  const { policyCharacters = [] } = options;

  const configs: FieldConfig[] = [];

  for (const spec of specs) {
    if (spec.skipInForm) continue;

    const base = {
      name: spec.name,
      label: spec.label,
      required: spec.required,
      placeholder: spec.placeholder,
      helperText: spec.helperText,
      ...(spec.defaultValue !== undefined && { defaultValue: spec.defaultValue }),
      ...(spec.defaultFromOptions && { defaultFromOptions: spec.defaultFromOptions }),
    };

    switch (spec.kind) {
      case 'text':
        configs.push({ ...base, type: 'text' });
        break;
      case 'textarea':
        configs.push({
          ...base,
          type: 'textarea',
          rows: 4,
        });
        break;
      case 'select':
        configs.push({
          ...base,
          type: 'select',
          options: spec.options
            ? spec.options.map((o) => ({ value: o.value, label: o.label }))
            : [],
        });
        break;
      case 'checkbox':
        configs.push({ ...base, type: 'checkbox' });
        break;
      case 'numberText':
        configs.push({
          ...base,
          type: 'text',
          inputType: 'number',
        });
        break;
      case 'imageUpload':
        configs.push({
          ...base,
          type: 'imageUpload',
          helperText: spec.helperText ?? '/assets/... or CDN key',
        });
        break;
      case 'visibility':
        configs.push({
          ...base,
          type: 'visibility',
          characters: policyCharacters,
          allowHidden: false,
        });
        break;
      case 'json':
        configs.push({
          ...base,
          type: 'json',
          placeholder: spec.placeholder,
          minRows: spec.minRows ?? 4,
          maxRows: spec.maxRows ?? 16,
        });
        break;
      default:
        break;
    }
  }

  return configs;
};
