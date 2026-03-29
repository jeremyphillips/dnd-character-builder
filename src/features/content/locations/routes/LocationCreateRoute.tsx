import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider';
import { EntryEditorLayout } from '@/features/content/shared/components';
import { useCampaignMembers } from '@/features/campaign/hooks';
import { useAccessPolicyField } from '@/features/content/shared/hooks/useAccessPolicyField';
import type { ValidationError } from '@/features/content/shared/hooks/editRoute.types';
import {
  locationRepo,
  type LocationFormValues,
  getLocationFieldConfigs,
  LOCATION_FORM_DEFAULTS,
  toLocationInput,
  useParentLocationPickerOptions,
  validateGridBootstrap,
  bootstrapDefaultLocationMap,
} from '@/features/content/locations/domain';
import { ConditionalFormRenderer } from '@/ui/patterns';
import { CELL_UNITS_BY_KIND, mapKindForLocationScale } from '@/shared/domain/locations';
import { GRID_SIZE_PRESETS } from '@/shared/domain/grid/gridPresets';
import type { LocationScaleId } from '@/shared/domain/locations';

const FORM_ID = 'location-create-form';

export default function LocationCreateRoute() {
  const { campaignId } = useActiveCampaign();
  const navigate = useNavigate();
  const { approvedCharacters: policyCharacters } = useCampaignMembers();

  const methods = useForm<LocationFormValues>({
    defaultValues: LOCATION_FORM_DEFAULTS,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const { setValue, watch, formState: { isDirty } } = methods;

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const { policyValue, handlePolicyChange } =
    useAccessPolicyField<LocationFormValues>(watch, setValue);

  const parentLocationOptions = useParentLocationPickerOptions(campaignId ?? undefined);

  const scale = watch('scale');
  const gridCellUnitOptions = useMemo(() => {
    const kind = mapKindForLocationScale(scale);
    return CELL_UNITS_BY_KIND[kind].map((u) => ({ value: u, label: u }));
  }, [scale]);

  const gridPreset = watch('gridPreset');
  const createGrid = watch('createGrid');
  useEffect(() => {
    if (!createGrid || !gridPreset) return;
    const p = GRID_SIZE_PRESETS[gridPreset as keyof typeof GRID_SIZE_PRESETS];
    if (p) {
      setValue('gridColumns', String(p.columns));
      setValue('gridRows', String(p.rows));
    }
  }, [createGrid, gridPreset, setValue]);

  const fieldConfigs = useMemo(
    () =>
      getLocationFieldConfigs({
        policyCharacters,
        parentLocationOptions,
        gridCellUnitOptions,
      }),
    [policyCharacters, parentLocationOptions, gridCellUnitOptions],
  );

  const handleSubmit = useCallback(
    async (values: LocationFormValues) => {
      if (!campaignId) return;
      const err = validateGridBootstrap(values);
      if (err) {
        setErrors([{ path: '', code: 'VALIDATION', message: err }]);
        return;
      }
      setSaving(true);
      setErrors([]);
      try {
        const input = toLocationInput(values);
        const created = await locationRepo.createEntry(campaignId, input);
        if (values.createGrid) {
          await bootstrapDefaultLocationMap(
            campaignId,
            created.id,
            created.name,
            created.scale as LocationScaleId,
            values,
          );
        }
        navigate(`/campaigns/${campaignId}/world/locations/${created.id}`, { replace: true });
      } catch (e) {
        setErrors([
          { path: '', code: 'SAVE_FAILED', message: (e as Error).message },
        ]);
      } finally {
        setSaving(false);
      }
    },
    [campaignId, navigate],
  );

  const handleBack = useCallback(() => {
    navigate(`/campaigns/${campaignId}/world/locations`);
  }, [navigate, campaignId]);

  return (
    <FormProvider {...methods}>
      <EntryEditorLayout
        typeLabel="Location"
        isNew
        saving={saving}
        dirty={isDirty}
        success={false}
        errors={errors}
        formId={FORM_ID}
        onBack={handleBack}
        showPolicyField
        policyValue={policyValue}
        onPolicyChange={handlePolicyChange}
        policyCharacters={policyCharacters}
      >
        <form id={FORM_ID} onSubmit={methods.handleSubmit(handleSubmit)} noValidate>
          <ConditionalFormRenderer fields={fieldConfigs} />
        </form>
      </EntryEditorLayout>
    </FormProvider>
  );
}
