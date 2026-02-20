import { useEffect, useRef, useMemo } from 'react'
import { useWatch, useFormContext } from 'react-hook-form'
import { editions, settings } from '@/data'
import {
  AppForm,
  DynamicFormRenderer,
  FormActions,
  type FieldConfig,
} from '@/ui/components/form'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

export interface CampaignFormData {
  name: string
  edition: string
  setting: string
}

// ---------------------------------------------------------------------------
// Inner component — watches edition and renders dynamic fields
// ---------------------------------------------------------------------------

function CampaignFields({ canEdit }: { canEdit: boolean }) {
  const { setValue } = useFormContext<CampaignFormData>()
  const edition = useWatch<CampaignFormData, 'edition'>({ name: 'edition' })
  const prevEdition = useRef(edition)

  // Reset setting when the edition changes (skip initial render)
  useEffect(() => {
    if (prevEdition.current !== edition) {
      setValue('setting', '')
      prevEdition.current = edition
    }
  }, [edition, setValue])

  const selectedEdition = editions.find(e => e.id === edition)

  const settingOptions = useMemo(() => {
    if (!selectedEdition) return []
    return selectedEdition.settings
      .map((id: string) => settings.find(s => s.id === id))
      .filter(Boolean)
      .map(s => ({ value: s!.id, label: s!.name }))
  }, [selectedEdition])

  const fields: FieldConfig[] = useMemo(() => [
    {
      type: 'text' as const,
      name: 'name',
      label: 'Name',
      placeholder: 'Campaign name',
      required: true,
      disabled: !canEdit,
    },
    {
      type: 'select' as const,
      name: 'edition',
      label: 'Edition',
      options: editions.map(ed => ({ value: ed.id, label: ed.name })),
      placeholder: 'Select edition…',
      required: true,
      disabled: !canEdit,
    },
    {
      type: 'select' as const,
      name: 'setting',
      label: 'Setting',
      options: settingOptions,
      placeholder: edition ? 'Select setting…' : 'Choose an edition first',
      required: true,
      disabled: !edition || !canEdit,
    },
  ], [canEdit, edition, settingOptions])

  return <DynamicFormRenderer fields={fields} />
}

// ---------------------------------------------------------------------------
// CampaignForm
// ---------------------------------------------------------------------------

export default function CampaignForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  canEdit = true,
}: {
  initial: CampaignFormData
  onSubmit: (data: CampaignFormData) => Promise<void>
  onCancel: () => void
  submitLabel: string
  /** @deprecated Handled automatically by FormActions via react-hook-form isSubmitting state */
  submittingLabel?: string
  canEdit?: boolean
}) {
  return (
    <AppForm<CampaignFormData>
      defaultValues={initial}
      onSubmit={onSubmit}
    >
      <CampaignFields canEdit={canEdit} />

      {canEdit && (
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <FormActions submitLabel={submitLabel} />
        </Stack>
      )}
    </AppForm>
  )
}
