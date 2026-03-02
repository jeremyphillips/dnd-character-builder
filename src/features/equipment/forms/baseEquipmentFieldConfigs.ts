/**
 * Shared field configs for equipment Create/Edit forms.
 *
 * Single source of truth for common fields: name, description, imageKey, accessPolicy.
 * Use with AppForm + DynamicFormRenderer.
 */
import type { FieldConfig } from '@/ui/patterns';

export type BaseEquipmentFieldConfigsOptions = {
  /** Include description textarea. Default true. */
  includeDescription?: boolean;
  /** Include imageKey (ImageUploadField). Default true. */
  includeImageKey?: boolean;
  /** Include accessPolicy (VisibilityField). Default true. */
  includeAccessPolicy?: boolean;
  /** Characters for restricted visibility scope. Required when includeAccessPolicy is true and restricted scope is used. */
  policyCharacters?: { id: string; name: string }[];
  /** If FieldConfig supports dense/size in future, pass through. Not used by current FieldConfig. */
  dense?: boolean;
};

/**
 * Returns FieldConfig[] for the common equipment form fields.
 *
 * Compatible with:
 *   <AppForm defaultValues={...} onSubmit={...}>
 *     <DynamicFormRenderer fields={baseEquipmentFieldConfigs(options)} />
 *   </AppForm>
 */
export const baseEquipmentFieldConfigs = (
  options: BaseEquipmentFieldConfigsOptions = {}
): FieldConfig[] => {
  const {
    includeDescription = true,
    includeImageKey = true,
    includeAccessPolicy = true,
    policyCharacters = [],
  } = options;

  const configs: FieldConfig[] = [
    {
      type: 'text',
      name: 'name',
      label: 'Name',
      required: true,
      placeholder: 'Item name',
    },
  ];

  if (includeDescription) {
    configs.push({
      type: 'textarea',
      name: 'description',
      label: 'Description',
      rows: 4,
      placeholder: 'Describe the item...',
    });
  }

  if (includeImageKey) {
    configs.push({
      type: 'imageUpload',
      name: 'imageKey',
      label: 'Image',
      helperText: '/assets/... or CDN key',
    });
  }

  if (includeAccessPolicy) {
    configs.push({
      type: 'visibility',
      name: 'accessPolicy',
      label: 'Visibility',
      characters: policyCharacters,
      allowHidden: false,
    });
  }

  return configs;
};
