import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FieldConfig } from './form.types';
import DynamicField from './DynamicField';
import DriverField from './DriverField';
import type { PatchDriver } from './DriverField';

export type FormDriver =
  | { kind: 'rhf' }
  | {
      kind: 'patch';
      getValue: (path: string) => unknown;
      setValue: (path: string, value: unknown) => void;
      unsetValue?: (path: string) => void;
    };

type DynamicFormRendererProps = {
  fields: FieldConfig[];
  spacing?: number;
  /**
   * When omitted or kind: 'rhf', uses react-hook-form (FormProvider must wrap).
   * When kind: 'patch', uses driver.getValue/setValue instead.
   */
  driver?: FormDriver;
};

/**
 * Pure rendering layer: takes a FieldConfig[] and renders the
 * correct field primitive for each entry. No business logic,
 * no fetching, no validation rules beyond what FieldConfig carries.
 */
export default function DynamicFormRenderer({
  fields,
  spacing = 3,
  driver,
}: DynamicFormRendererProps) {
  const usePatchDriver = driver?.kind === 'patch';
  const patchDriver = usePatchDriver ? (driver as PatchDriver) : null;

  return (
    <Stack spacing={spacing}>
      {fields.map((field) =>
        field.type === 'hidden' ? (
          usePatchDriver && patchDriver ? (
            <DriverField key={field.name} field={field} driver={patchDriver} />
          ) : (
            <DynamicField key={field.name} field={field} />
          )
        ) : (
          <Box key={field.name}>
            {usePatchDriver && patchDriver ? (
              <DriverField field={field} driver={patchDriver} />
            ) : (
              <DynamicField field={field} />
            )}
          </Box>
        )
      )}
    </Stack>
  );
}
