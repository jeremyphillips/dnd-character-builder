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
import { armorRepo } from '@/features/content/domain/repo';
import type { ArmorInput } from '@/features/content/domain/types';
import {
  type ArmorFormValues,
  getArmorFieldConfigs,
  toArmorInput,
} from '@/features/equipment/armor/forms';

type ValidationError = { path: string; code: string; message: string };

const FORM_ID = 'armor-create-form';

const DEFAULT_VALUES: ArmorFormValues = {
  name: '',
  description: '',
  imageKey: '',
  accessPolicy: DEFAULT_VISIBILITY_PUBLIC,
  category: 'light',
  material: 'metal',
  baseAC: '',
  acBonus: '',
  stealthDisadvantage: false,
};

export default function ArmorCreateRoute() {
  const { campaignId } = useActiveCampaign();
  const navigate = useNavigate();
  const { approvedCharacters: policyCharacters } = useCampaignMembers();

  const methods = useForm<ArmorFormValues>({ defaultValues: DEFAULT_VALUES });
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
    async (values: ArmorFormValues) => {
      if (!campaignId) return;
      setSaving(true);
      setErrors([]);

      const input: ArmorInput = toArmorInput(values);

      try {
        const created = await armorRepo.createEntry(campaignId, input);
        navigate(`/campaigns/${campaignId}/world/equipment/armor/${created.id}`, {
          replace: true,
        });
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
    navigate(`/campaigns/${campaignId}/world/equipment/armor`);
  }, [navigate, campaignId]);

  const fieldConfigs = getArmorFieldConfigs({ policyCharacters });

  return (
    <FormProvider {...methods}>
      <EntryEditorLayout
        typeLabel="Armor"
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
