import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import FormTextField from '@/ui/patterns/form/FormTextField';

/** Controlled name + description for Selection rail (e.g. path inspector). */
export type RailNameDescriptionFieldsProps = {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  nameLabel?: string;
  descriptionLabel?: string;
};

export function RailNameDescriptionFields({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  nameLabel = 'Name',
  descriptionLabel = 'Description',
}: RailNameDescriptionFieldsProps) {
  return (
    <Stack spacing={2}>
      <TextField
        label={nameLabel}
        size="small"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        fullWidth
      />
      <TextField
        label={descriptionLabel}
        size="small"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />
    </Stack>
  );
}

/**
 * RHF-backed name + description using shared `FormTextField` patterns.
 * Must render under `FormProvider` (e.g. region metadata form).
 */
export type RailNameDescriptionFormFieldsProps = {
  nameFieldName?: string;
  descriptionFieldName?: string;
  nameLabel?: string;
  descriptionLabel?: string;
  nameRequired?: boolean;
  onNameAfterChange?: (raw: string) => void;
};

export function RailNameDescriptionFormFields({
  nameFieldName = 'name',
  descriptionFieldName = 'description',
  nameLabel = 'Name',
  descriptionLabel = 'Description',
  nameRequired = false,
  onNameAfterChange,
}: RailNameDescriptionFormFieldsProps) {
  return (
    <Stack spacing={2}>
      <FormTextField
        name={nameFieldName}
        label={nameLabel}
        required={nameRequired}
        size="small"
        onAfterChange={onNameAfterChange}
      />
      <FormTextField name={descriptionFieldName} label={descriptionLabel} multiline rows={3} size="small" />
    </Stack>
  );
}
