// Campaign-owned equipment items are editable. System items are edited via patching.
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { DynamicFormRenderer } from '@/ui/patterns';
import type { Visibility } from '@/shared/types';
import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider';
import { DEFAULT_VISIBILITY_PUBLIC } from '@/ui/patterns';
import { EntryEditorLayout } from '@/features/content/components';
import { useCampaignMembers } from '@/features/campaign/hooks';
import { weaponRepo } from '@/features/content/domain/repo';
import type { WeaponInput } from '@/features/content/domain/types';
import {
  type WeaponFormValues,
  getWeaponFieldConfigs,
  toWeaponInput,
} from '@/features/equipment/weapons/forms';

type ValidationError = { path: string; code: string; message: string };

const FORM_ID = 'weapon-create-form';

const DEFAULT_VALUES: WeaponFormValues = {
  name: '',
  description: '',
  imageKey: '',
  accessPolicy: DEFAULT_VISIBILITY_PUBLIC,
  category: 'simple',
  mode: 'melee',
  damageDefault: '1d6',
  damageVersatile: '',
  damageType: 'slashing',
  mastery: '',
  rangeNormal: '',
  rangeLong: '',
  properties: [],
};

export default function WeaponCreateRoute() {
  const { campaignId } = useActiveCampaign();
  const navigate = useNavigate();
  const { approvedCharacters: policyCharacters } = useCampaignMembers();

  const methods = useForm<WeaponFormValues>({ defaultValues: DEFAULT_VALUES });
  const { setValue, watch, formState: { isDirty } } = methods;

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const policyValue = watch('accessPolicy');
  const handlePolicyChange = useCallback(
    (next: Visibility) => {
      setValue('accessPolicy', next, { shouldDirty: true });
    },
    [setValue]
  );

  const handleSubmit = useCallback(
    async (values: WeaponFormValues) => {
      if (!campaignId) return;
      setSaving(true);
      setErrors([]);

      const input: WeaponInput = toWeaponInput(values);

      try {
        const created = await weaponRepo.createEntry(campaignId, input);
        navigate(
          `/campaigns/${campaignId}/world/equipment/weapons/${created.id}`,
          { replace: true }
        );
      } catch (err) {
        setErrors([
          { path: '', code: 'SAVE_FAILED', message: (err as Error).message },
        ]);
      } finally {
        setSaving(false);
      }
    },
    [campaignId, navigate]
  );

  const handleBack = useCallback(() => {
    navigate(`/campaigns/${campaignId}/world/equipment/weapons`);
  }, [navigate, campaignId]);

  const fieldConfigs = getWeaponFieldConfigs({ policyCharacters });

  return (
    <FormProvider {...methods}>
      <EntryEditorLayout
        typeLabel="Weapon"
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
          <DynamicFormRenderer fields={fieldConfigs} />
        </form>
      </EntryEditorLayout>
    </FormProvider>
  );
}
