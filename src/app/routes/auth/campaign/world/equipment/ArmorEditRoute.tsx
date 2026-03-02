/**
 * Armor edit route.
 *
 * - source === 'system': JSON patch editor via contentPatchRepo
 * - source === 'campaign': real form editor with delete support
 */
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Visibility } from '@/shared/types';
import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider';
import { DEFAULT_VISIBILITY_PUBLIC } from '@/ui/patterns';
import { EntryEditorLayout } from '@/features/content/components';
import { useCampaignMembers } from '@/features/campaign/hooks';
import { armorRepo } from '@/features/content/domain/repo';
import type { Armor, ArmorInput } from '@/features/content/domain/types';
import { useCampaignContentEntry } from '@/features/content/hooks/useCampaignContentEntry';
import {
  getContentPatch,
  getEntryPatch,
  upsertEntryPatch,
  removeEntryPatch,
} from '@/features/content/domain/contentPatchRepo';
import { DynamicFormRenderer, JsonPreviewField } from '@/ui/patterns';
import { AppAlert, AppBadge } from '@/ui/primitives';
import {
  type ArmorFormValues,
  getArmorFieldConfigs,
  armorToFormValues,
  toArmorInput,
} from '@/features/equipment/armor/forms';

type ValidationError = { path: string; code: string; message: string };

const FORM_ID = 'armor-edit-form';

export default function ArmorEditRoute() {
  const { campaignId, campaign } = useActiveCampaign();
  const { armorId } = useParams<{ armorId: string }>();
  const navigate = useNavigate();
  const { approvedCharacters: policyCharacters } = useCampaignMembers();

  const viewer = campaign?.viewer;
  const canDelete = Boolean(
    armorId && campaignId && (viewer?.isPlatformAdmin || viewer?.isOwner)
  );

  const { entry: armor, loading, error, notFound } = useCampaignContentEntry<Armor>({
    campaignId: campaignId ?? undefined,
    entryId: armorId,
    fetchEntry: armorRepo.getEntry,
  });

  const methods = useForm<ArmorFormValues>({
    defaultValues: {
      name: '',
      description: '',
      imageKey: '',
      accessPolicy: DEFAULT_VISIBILITY_PUBLIC,
      category: 'light',
      material: 'metal',
      baseAC: '',
      acBonus: '',
      stealthDisadvantage: false,
    },
  });
  const { reset, setValue, watch, formState: { isDirty } } = methods;
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const [patchText, setPatchText] = useState('');
  const [initialPatchText, setInitialPatchText] = useState('');
  const [patchSaveError, setPatchSaveError] = useState<string | null>(null);

  const isSystem = armor?.source === 'system';
  const isCampaign = armor?.source === 'campaign';

  useEffect(() => {
    if (!armor || !isCampaign) return;
    reset(armorToFormValues(armor));
  }, [armor, isCampaign, reset]);

  useEffect(() => {
    if (!campaignId || !armorId || !armor || !isSystem) return;
    let cancelled = false;
    getContentPatch(campaignId)
      .then((doc) => {
        if (cancelled) return;
        const existing = getEntryPatch(doc, 'armor', armorId);
        if (existing) {
          const t = JSON.stringify(existing, null, 2);
          setPatchText(t);
          setInitialPatchText(t);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [campaignId, armorId, armor, isSystem]);

  useEffect(() => {
    const sub = watch(() => {
      setSuccess(false);
      setErrors([]);
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const policyValue = watch('accessPolicy');
  const handlePolicyChange = useCallback(
    (next: Visibility) => setValue('accessPolicy', next, { shouldDirty: true }),
    [setValue]
  );

  const handleCampaignSubmit = useCallback(
    async (values: ArmorFormValues) => {
      if (!campaignId || !armorId) return;
      setSaving(true);
      setSuccess(false);
      setErrors([]);
      const input: ArmorInput = toArmorInput(values);
      try {
        const updated = await armorRepo.updateEntry(campaignId, armorId, input);
        reset(armorToFormValues(updated));
        setSuccess(true);
      } catch (err) {
        setErrors([
          { path: '', code: 'SAVE_FAILED', message: (err as Error).message },
        ]);
      } finally {
        setSaving(false);
      }
    },
    [campaignId, armorId, reset]
  );

  const patchDirty = patchText !== initialPatchText;
  const tryParse = useCallback((t: string) => {
    const s = t.trim();
    if (!s) return { valid: true as const, value: {} };
    try {
      return { valid: true as const, value: JSON.parse(s) };
    } catch {
      return { valid: false as const, value: null };
    }
  }, []);
  const parsed = tryParse(patchText);

  const handlePatchSave = useCallback(async () => {
    if (!campaignId || !armorId || !parsed.valid) return;
    setSaving(true);
    setPatchSaveError(null);
    try {
      await upsertEntryPatch(campaignId, 'armor', armorId, parsed.value);
      setInitialPatchText(patchText);
      setSuccess(true);
    } catch (err) {
      setPatchSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }, [campaignId, armorId, parsed, patchText]);

  const handleRemovePatch = useCallback(async () => {
    if (!campaignId || !armorId) return;
    setSaving(true);
    try {
      await removeEntryPatch(campaignId, 'armor', armorId);
      setPatchText('');
      setInitialPatchText('');
      setSuccess(true);
    } catch (err) {
      setPatchSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }, [campaignId, armorId]);

  const handleDelete = useCallback(async () => {
    if (!campaignId || !armorId) return;
    await armorRepo.deleteEntry(campaignId, armorId);
    navigate(`/campaigns/${campaignId}/world/equipment/armor`, {
      replace: true,
    });
  }, [campaignId, armorId, navigate]);

  const handleBack = useCallback(
    () => navigate(`/campaigns/${campaignId}/world/equipment/armor`),
    [navigate, campaignId]
  );

  const fieldConfigs = getArmorFieldConfigs({ policyCharacters });

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  if (error || notFound || !armor)
    return (
      <AppAlert tone="danger">{error ?? 'Armor not found.'}</AppAlert>
    );

  if (isSystem) {
    return (
      <EntryEditorLayout
        typeLabel="Armor Patch"
        isNew={false}
        saving={saving}
        dirty={patchDirty}
        success={success}
        errors={
          patchSaveError
            ? [{ path: '', code: 'SAVE_FAILED', message: patchSaveError }]
            : []
        }
        onSave={handlePatchSave}
        onBack={handleBack}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            Patching: {armor.name}
          </Typography>
          {armor.patched && (
            <AppBadge label="Patched" tone="warning" size="small" />
          )}
          <Typography variant="body2" color="text.secondary">
            Enter a JSON object to deep-merge into this system armor for your
            campaign.
          </Typography>
          <JsonPreviewField
            label="Patch JSON"
            value={patchText}
            onChange={(v) => {
              setPatchText(v);
              setSuccess(false);
              setPatchSaveError(null);
            }}
            placeholder={'{\n  "baseAC": 14,\n  "description": "Custom description..."\n}'}
            minRows={8}
            maxRows={20}
          />
          {initialPatchText && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleRemovePatch}
              disabled={saving}
              sx={{ alignSelf: 'flex-start' }}
            >
              Remove patch
            </Button>
          )}
        </Stack>
      </EntryEditorLayout>
    );
  }

  return (
    <FormProvider {...methods}>
      <EntryEditorLayout
        typeLabel="Armor"
        isNew={false}
        saving={saving}
        dirty={isDirty}
        success={success}
        errors={errors}
        formId={FORM_ID}
        onBack={handleBack}
        canDelete={canDelete}
        onDelete={handleDelete}
        validateDelete={async () => ({ allowed: true as const })}
        showPolicyField
        policyValue={policyValue}
        onPolicyChange={handlePolicyChange}
        policyCharacters={policyCharacters}
      >
        <form
          id={FORM_ID}
          onSubmit={methods.handleSubmit(handleCampaignSubmit)}
          noValidate
        >
          <DynamicFormRenderer fields={fieldConfigs} />
        </form>
      </EntryEditorLayout>
    </FormProvider>
  );
}
