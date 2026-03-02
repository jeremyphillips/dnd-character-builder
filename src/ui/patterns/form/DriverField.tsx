/**
 * Renders a single field using a patch driver (getValue/setValue).
 * Used when DynamicFormRenderer is in patch mode.
 */
import { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from '@mui/material';
import type { FieldConfig } from './form.types';
import { usePatchValidation } from './validation/PatchValidationContext';
import ImageUploadField from './ImageUploadField';
import JsonPreviewField from './JsonPreviewField';
import VisibilityField from './VisibilityField';

export type PatchDriver = {
  getValue(path: string): unknown;
  setValue(path: string, value: unknown): void;
  unsetValue?(path: string): void;
};

type DriverFieldProps = {
  field: FieldConfig;
  driver: PatchDriver;
};

/** Resolve patch path: prefer field.path ?? field.name when path exists (e.g. json). */
const getPath = (field: FieldConfig): string =>
  'path' in field ? (field.path ?? field.name) : field.name;

export default function DriverField({ field, driver }: DriverFieldProps) {
  const path = getPath(field);
  const patchValidation = usePatchValidation();
  const errorMessage = patchValidation?.getError(field.name);

  const handleChange = useCallback(
    (value: unknown) => {
      driver.setValue(path, value);
      patchValidation?.clearError(field.name);
    },
    [driver, path, field.name, patchValidation],
  );

  const handleBlur = useCallback(() => {
    if (!patchValidation) return;
    patchValidation.validateOne(field, (p) => driver.getValue(p));
  }, [patchValidation, field, driver]);

  const helperText = errorMessage ?? field.helperText;
  const hasError = Boolean(errorMessage);

  switch (field.type) {
    case 'text':
      return (
        <TextField
          label={field.label}
          fullWidth
          value={String(driver.getValue(path) ?? '')}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          required={field.required}
          disabled={field.disabled}
          placeholder={field.placeholder}
          type={field.inputType ?? 'text'}
          helperText={helperText}
          error={hasError}
          multiline={field.multiline}
          rows={field.multiline ? field.rows : undefined}
        />
      );

    case 'textarea':
      return (
        <TextField
          label={field.label}
          fullWidth
          multiline
          rows={field.rows ?? 4}
          value={String(driver.getValue(path) ?? '')}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          required={field.required}
          disabled={field.disabled}
          placeholder={field.placeholder}
          helperText={helperText}
          error={hasError}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth disabled={field.disabled} required={field.required} error={hasError}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            label={field.label}
            value={String(driver.getValue(path) ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            displayEmpty
          >
            {field.placeholder && (
              <MenuItem value="" disabled>
                {field.placeholder}
              </MenuItem>
            )}
            {field.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          {(helperText || hasError) && (
            <FormHelperText error={hasError}>{helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'radio':
      return (
        <FormControl disabled={field.disabled} required={field.required} error={hasError}>
          <FormLabel required={field.required}>{field.label}</FormLabel>
          <RadioGroup
            row={field.row}
            value={String(driver.getValue(path) ?? '')}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
          >
            {field.options.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                label={opt.label}
              />
            ))}
          </RadioGroup>
          {(helperText || hasError) && (
            <FormHelperText error={hasError}>{helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl disabled={field.disabled} required={field.required} error={hasError}>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(driver.getValue(path))}
                onChange={(e) => handleChange(e.target.checked)}
              />
            }
            label={field.label}
          />
          {(helperText || hasError) && (
            <FormHelperText error={hasError}>{helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'checkboxGroup':
      return (
        <FormControl disabled={field.disabled} required={field.required} error={hasError}>
          <FormLabel required={field.required}>{field.label}</FormLabel>
          <FormGroup row={field.row}>
            {(field.options ?? []).map((opt) => {
              const selected: string[] = Array.isArray(driver.getValue(path))
                ? (driver.getValue(path) as string[])
                : [];
              const handleToggle = () => {
                const next = selected.includes(opt.value)
                  ? selected.filter((v) => v !== opt.value)
                  : [...selected, opt.value];
                handleChange(next);
              };
              return (
                <FormControlLabel
                  key={opt.value}
                  control={
                    <Checkbox
                      checked={selected.includes(opt.value)}
                      onChange={handleToggle}
                    />
                  }
                  label={opt.label}
                />
              );
            })}
          </FormGroup>
          {(helperText || hasError) && (
            <FormHelperText error={hasError}>{helperText}</FormHelperText>
          )}
        </FormControl>
      );

    case 'imageUpload':
      return (
        <ImageUploadField
          value={driver.getValue(path) as string | null | undefined}
          onChange={(v) => handleChange(v)}
          label={field.label}
          disabled={field.disabled}
          maxHeight={field.maxHeight}
          required={field.required}
        />
      );

    case 'datetime':
      return (
        <TextField
          label={field.label}
          fullWidth
          type="datetime-local"
          value={
            (() => {
              const v = driver.getValue(path);
              if (!v) return '';
              const d = new Date(v as string);
              return isNaN(d.getTime())
                ? ''
                : d.toISOString().slice(0, 16);
            })()
          }
          onChange={(e) =>
            handleChange(e.target.value ? new Date(e.target.value).toISOString() : null)
          }
          onBlur={handleBlur}
          required={field.required}
          disabled={field.disabled}
          helperText={helperText}
          error={hasError}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'visibility':
      return (
        <VisibilityField
          value={
            (driver.getValue(path) as { scope: string; allowCharacterIds?: string[] }) ?? {
              scope: 'public',
              allowCharacterIds: [],
            }
          }
          onChange={(v) => handleChange(v)}
          disabled={field.disabled}
          required={field.required}
          characters={field.characters}
        />
      );

    case 'json':
      return (
        <DriverJsonField
          field={field}
          path={path}
          driver={driver}
          errorMessage={errorMessage}
          onClearError={() => patchValidation?.clearError(field.name)}
        />
      );

    case 'hidden': {
      const value = driver.getValue(path);
      if (value == null) return null;
      return (
        <input type="hidden" name={path} value={String(value)} />
      );
    }

    default:
      return null;
  }
}

function initJsonText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  if (typeof value === 'string') return value;
  return '';
}

function DriverJsonField({
  field,
  path,
  driver,
  errorMessage,
  onClearError,
}: {
  field: Extract<FieldConfig, { type: 'json' }>;
  path: string;
  driver: PatchDriver;
  errorMessage?: string;
  onClearError?: () => void;
}) {
  const [text, setText] = useState(() => initJsonText(driver.getValue(path)));

  useEffect(() => {
    setText(initJsonText(driver.getValue(path)));
  }, [path, driver]);

  const handleChange = (next: string) => {
    setText(next);
    onClearError?.();
    if (next.trim().length === 0) {
      if (driver.unsetValue) {
        driver.unsetValue(path);
      } else {
        driver.setValue(path, {});
      }
      return;
    }
    try {
      const parsed = JSON.parse(next);
      driver.setValue(path, parsed);
    } catch {
      // Invalid JSON: do not commit. JsonPreviewField shows inline error.
    }
  };

  const helperText = errorMessage ?? field.helperText;

  return (
    <Box>
      <JsonPreviewField
        label={field.label}
        value={text}
        onChange={handleChange}
        placeholder={field.placeholder}
        helperText={helperText}
        minRows={field.minRows ?? 4}
        maxRows={field.maxRows ?? 16}
        required={field.required}
        error={Boolean(errorMessage)}
      />
    </Box>
  );
}
