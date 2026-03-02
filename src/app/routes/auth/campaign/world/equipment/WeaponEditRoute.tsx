/**
 * Weapon edit route.
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
import { weaponRepo } from '@/features/content/domain/repo';
import type { Weapon, WeaponInput } from '@/features/content/domain/types';
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
  type WeaponFormValues,
  getWeaponFieldConfigs,
  weaponToFormValues,
  toWeaponInput,
} from '@/features/equipment/weapons/forms';

type ValidationError = { path: string; code: string; message: string };

const FORM_ID = 'weapon-edit-form';

const EMPTY_FORM_VALUES: WeaponFormValues = {
  name: '',
  description: '',
  imageKey: '',
  accessPolicy: DEFAULT_VISIBILITY_PUBLIC,
  category: 'simple',
  mode: 'melee',
  damageDefault: '',
  damageVersatile: '',
  damageType: '',
  mastery: '',
  rangeNormal: '',
  rangeLong: '',
  properties: [],
};

export default function WeaponEditRoute() {
  const { campaignId, campaign } = useActiveCampaign();
  const { weaponId } = useParams<{ weaponId: string }>();
  const navigate = useNavigate();
  const { approvedCharacters: policyCharacters } = useCampaignMembers();

  const viewer = campaign?.viewer;
  const canDelete = Boolean(
    weaponId && campaignId && (viewer?.isPlatformAdmin || viewer?.isOwner)
  );

  const { entry: weapon, loading, error, notFound } =
    useCampaignContentEntry<Weapon>({
      campaignId: campaignId ?? undefined,
      entryId: weaponId,
      fetchEntry: weaponRepo.getEntry,
    });

  const methods = useForm<WeaponFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
  });
  const { reset, setValue, watch, formState: { isDirty } } = methods;
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const [patchText, setPatchText] = useState('');
  const [initialPatchText, setInitialPatchText] = useState('');
  const [patchSaveError, setPatchSaveError] = useState<string | null>(null);

  const isSystem = weapon?.source === 'system';
  const isCampaign = weapon?.source === 'campaign';

  useEffect(() => {
    if (!weapon || !isCampaign) return;
    reset(weaponToFormValues(weapon));
  }, [weapon, isCampaign, reset]);

  useEffect(() => {
    if (!campaignId || !weaponId || !weapon || !isSystem) return;
    let cancelled = false;
    getContentPatch(campaignId)
      .then((doc) => {
        if (cancelled) return;
        const existing = getEntryPatch(doc, 'weapons', weaponId);
        if (existing) {
          const text = JSON.stringify(existing, null, 2);
          setPatchText(text);
          setInitialPatchText(text);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [campaignId, weaponId, weapon, isSystem]);

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
    async (values: WeaponFormValues) => {
      if (!campaignId || !weaponId) return;
      setSaving(true);
      setSuccess(false);
      setErrors([]);
      const input: WeaponInput = toWeaponInput(values);
      try {
        const updated = await weaponRepo.updateEntry(campaignId, weaponId, input);
        reset(weaponToFormValues(updated));
        setSuccess(true);
      } catch (err) {
        setErrors([
          { path: '', code: 'SAVE_FAILED', message: (err as Error).message },
        ]);
      } finally {
        setSaving(false);
      }
    },
    [campaignId, weaponId, reset]
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
    if (!campaignId || !weaponId || !parsed.valid) return;
    setSaving(true);
    setPatchSaveError(null);
    try {
      await upsertEntryPatch(campaignId, 'weapons', weaponId, parsed.value);
      setInitialPatchText(patchText);
      setSuccess(true);
    } catch (err) {
      setPatchSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }, [campaignId, weaponId, parsed, patchText]);

  const handleRemovePatch = useCallback(async () => {
    if (!campaignId || !weaponId) return;
    setSaving(true);
    try {
      await removeEntryPatch(campaignId, 'weapons', weaponId);
      setPatchText('');
      setInitialPatchText('');
      setSuccess(true);
    } catch (err) {
      setPatchSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }, [campaignId, weaponId]);

  const handleDelete = useCallback(async () => {
    if (!campaignId || !weaponId) return;
    await weaponRepo.deleteEntry(campaignId, weaponId);
    navigate(`/campaigns/${campaignId}/world/equipment/weapons`, {
      replace: true,
    });
  }, [campaignId, weaponId, navigate]);

  const handleBack = useCallback(
    () => navigate(`/campaigns/${campaignId}/world/equipment/weapons`),
    [navigate, campaignId]
  );

  const fieldConfigs = getWeaponFieldConfigs({ policyCharacters });

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  if (error || notFound || !weapon)
    return (
      <AppAlert tone="danger">{error ?? 'Weapon not found.'}</AppAlert>
    );

  if (isSystem) {
    return (
      <EntryEditorLayout
        typeLabel="Weapon Patch"
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
            Patching: {weapon.name}
          </Typography>
          {weapon.patched && (
            <AppBadge label="Patched" tone="warning" size="small" />
          )}
          <Typography variant="body2" color="text.secondary">
            Enter a JSON object to deep-merge into this system weapon for your
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
            placeholder={'{\n  "description": "Custom description...",\n  "damage": { "default": "2d6" }\n}'}
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
        typeLabel="Weapon"
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
