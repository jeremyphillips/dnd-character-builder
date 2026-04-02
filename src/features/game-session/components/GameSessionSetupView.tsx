import { useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import type { GameSession, GameSessionStatus } from '../domain/game-session.types'
import type { GameSessionPatch } from '../api/gameSessionApi'
import type { Location } from '@/features/content/locations/domain/types'
import type { PickerOption } from '@/ui/patterns/form/OptionPickerField'
import { ApiError } from '@/app/api'
import FormTextField from '@/ui/patterns/form/FormTextField'
import FormDateTimeField from '@/ui/patterns/form/FormDateTimeField'
import FormSelectField from '@/ui/patterns/form/FormSelectField'
import OptionPickerField from '@/ui/patterns/form/OptionPickerField'
import { AppAlert } from '@/ui/primitives'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const STATUS_LABEL: Record<GameSessionStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  lobby: 'In lobby',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function statusChipColor(
  status: GameSessionStatus,
): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' {
  switch (status) {
    case 'draft':
      return 'default'
    case 'scheduled':
      return 'info'
    case 'lobby':
      return 'primary'
    case 'active':
      return 'success'
    case 'completed':
      return 'secondary'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

/** Form fields only — lifecycle `status` is set by Save draft / Schedule session / Open now actions. */
type FormValues = {
  title: string
  /** ISO string from FormDateTimeField, or null when cleared */
  scheduledFor: string | null
  locationIds: string[]
  floorId: string
}

function buildDefaults(session: GameSession): FormValues {
  const hasLocation = Boolean(session.location.locationId)
  const floor =
    hasLocation && session.location.floorId && /^\d+$/.test(session.location.floorId)
      ? session.location.floorId
      : '1'
  return {
    title: session.title,
    scheduledFor: session.scheduledFor ?? null,
    locationIds: session.location.locationId ? [session.location.locationId] : [],
    floorId: floor,
  }
}

function floorCountForBuilding(buildingId: string, all: Location[]): number {
  const n = all.filter((l) => l.parentId === buildingId && l.scale === 'floor').length
  return Math.max(1, n)
}

function buildPatch(
  vals: FormValues,
  locations: Location[],
  status: GameSessionStatus,
): GameSessionPatch {
  const locId = vals.locationIds[0] ?? null
  const building = locId ? locations.find((l) => l.id === locId) : null
  const isBuilding = building?.scale === 'building'
  return {
    title: vals.title.trim(),
    status,
    scheduledFor: vals.scheduledFor ? new Date(vals.scheduledFor).toISOString() : null,
    locationId: locId,
    locationLabel: null,
    buildingId: null,
    floorId: isBuilding ? (vals.floorId || '1') : null,
  }
}

type GameSessionSetupFormFieldsProps = {
  methods: UseFormReturn<FormValues>
  sessionStatus: GameSessionStatus
  canEdit: boolean
  locations: Location[]
  buildingPickerOptions: PickerOption[]
  saving: boolean
  onSaveDraft: () => void
  onScheduleSession: () => void
  onOpenNow: () => void
}

function GameSessionSetupFormFields({
  methods,
  sessionStatus,
  canEdit,
  locations,
  buildingPickerOptions,
  saving,
  onSaveDraft,
  onScheduleSession,
  onOpenNow,
}: GameSessionSetupFormFieldsProps) {
  const { watch, control, setValue, getValues } = methods

  const locationIds = watch('locationIds')
  const selectedBuildingId = locationIds?.[0]

  const selectedBuilding = useMemo(
    () => (selectedBuildingId ? locations.find((l) => l.id === selectedBuildingId) : undefined),
    [locations, selectedBuildingId],
  )

  const isBuildingLocation = Boolean(selectedBuilding) && selectedBuilding!.scale === 'building'

  const floorCount = useMemo(() => {
    if (!selectedBuildingId || !isBuildingLocation) return 0
    return floorCountForBuilding(selectedBuildingId, locations)
  }, [selectedBuildingId, isBuildingLocation, locations])

  const floorOptions = useMemo(
    () =>
      Array.from({ length: floorCount }, (_, i) => ({
        value: String(i + 1),
        label: `Floor ${i + 1}`,
      })),
    [floorCount],
  )

  useEffect(() => {
    if (!isBuildingLocation || !selectedBuildingId) return
    const max = floorCount
    const current = getValues('floorId')
    const n = current ? Number.parseInt(current, 10) : NaN
    if (!current || Number.isNaN(n) || n < 1 || n > max) {
      setValue('floorId', '1')
    }
  }, [isBuildingLocation, selectedBuildingId, floorCount, getValues, setValue])

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Current status
        </Typography>
        <Chip
          size="small"
          label={STATUS_LABEL[sessionStatus]}
          color={statusChipColor(sessionStatus)}
          variant={sessionStatus === 'draft' ? 'outlined' : 'filled'}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Use the buttons below to save a draft, schedule with a start time, or open the session to the
        lobby now. Status is updated by those actions, not by a separate control.
      </Typography>

      <FormTextField name="title" label="Session title" required size="small" disabled={!canEdit} />
      <FormDateTimeField name="scheduledFor" label="Scheduled start" disabled={!canEdit} />
      <Typography variant="caption" color="text.secondary" display="block">
        Planned start is for display and planning only. The lobby does not open automatically at this
        time — use Open now when you are ready to gather players.
      </Typography>

      <Controller
        name="locationIds"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <OptionPickerField
            label="Location (building)"
            options={buildingPickerOptions}
            value={field.value ?? []}
            onChange={field.onChange}
            maxItems={1}
            disabled={!canEdit}
            renderSelectedAs="card"
            placeholder="Search buildings…"
            helperText="Only building-scale locations are listed."
            emptyMessage="No building locations in this campaign."
          />
        )}
      />

      {isBuildingLocation && (
        <FormSelectField name="floorId" label="Floor" options={floorOptions} size="small" disabled={!canEdit} />
      )}

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
        <Button
          type="button"
          variant="outlined"
          disabled={!canEdit || saving}
          onClick={onSaveDraft}
        >
          {saving ? 'Saving…' : 'Save draft'}
        </Button>
        <Button
          type="button"
          variant="contained"
          color="primary"
          disabled={!canEdit || saving}
          onClick={onScheduleSession}
        >
          {saving ? 'Saving…' : 'Schedule session'}
        </Button>
        <Button
          type="button"
          variant="contained"
          color="secondary"
          disabled={!canEdit || saving}
          onClick={onOpenNow}
        >
          {saving ? 'Saving…' : 'Open now'}
        </Button>
      </Stack>
    </>
  )
}

type GameSessionSetupViewProps = {
  session: GameSession
  canEdit: boolean
  locations: Location[]
  onSave: (patch: GameSessionPatch) => Promise<void>
}

export function GameSessionSetupView({ session, canEdit, locations, onSave }: GameSessionSetupViewProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const methods = useForm<FormValues>({
    shouldUnregister: true,
    defaultValues: buildDefaults(session),
  })

  const { reset, getValues } = methods

  useEffect(() => {
    reset(buildDefaults(session))
  }, [session, reset])

  const buildingPickerOptions: PickerOption[] = useMemo(
    () =>
      locations
        .filter((l) => l.scale === 'building')
        .map((l) => ({
          value: l.id,
          label: l.name,
          description: l.category,
        })),
    [locations],
  )

  async function runAction(status: GameSessionStatus, validate: () => string | null) {
    setSaveError(null)
    if (!canEdit) return
    const err = validate()
    if (err) {
      setSaveError(err)
      return
    }
    setSaving(true)
    try {
      const vals = getValues()
      await onSave(buildPatch(vals, locations, status))
    } catch (e) {
      if (e instanceof ApiError) {
        setSaveError(e.message)
      } else {
        setSaveError('Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  const onSaveDraft = () =>
    runAction('draft', () => {
      const title = (getValues('title') ?? '').trim()
      if (!title) return 'Session title is required.'
      return null
    })

  const onScheduleSession = () =>
    runAction('scheduled', () => {
      const title = (getValues('title') ?? '').trim()
      if (!title) return 'Session title is required.'
      if (!getValues('scheduledFor')) return 'Set a scheduled start time to schedule this session.'
      return null
    })

  const onOpenNow = () =>
    runAction('lobby', () => {
      const title = (getValues('title') ?? '').trim()
      if (!title) return 'Session title is required.'
      return null
    })

  return (
    <Stack spacing={2}>
      <Typography variant="h5" component="h1">
        Session setup
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Plan and configure this live session. Changes are saved to the server.
      </Typography>

      {!canEdit && (
        <AppAlert tone="info">
          Only campaign DMs and owners can edit session setup. Players can use the lobby tab to view
          session details.
        </AppAlert>
      )}

      {saveError && (
        <AppAlert tone="danger" onClose={() => setSaveError(null)}>
          {saveError}
        </AppAlert>
      )}

      <Card variant="outlined">
        <CardContent>
          <FormProvider {...methods}>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <Stack spacing={2}>
                <GameSessionSetupFormFields
                  methods={methods}
                  sessionStatus={session.status}
                  canEdit={canEdit}
                  locations={locations}
                  buildingPickerOptions={buildingPickerOptions}
                  saving={saving}
                  onSaveDraft={onSaveDraft}
                  onScheduleSession={onScheduleSession}
                  onOpenNow={onOpenNow}
                />
              </Stack>
            </Box>
          </FormProvider>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Participants
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {session.participants.length} participant(s). Join flow and character assignment will
            build on this list later.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}
