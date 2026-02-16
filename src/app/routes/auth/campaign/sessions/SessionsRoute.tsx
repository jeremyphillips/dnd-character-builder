import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { apiFetch } from '@/app/api'
import { ROUTES } from '@/app/routes'
import type { Session } from '@/domain/session'
import { formatSessionDateTime } from '@/domain/session'
import { getPartyMembers } from '@/domain/party'
import { Breadcrumbs } from '@/ui/elements'
import { useBreadcrumbs } from '@/hooks'
import { FormModal } from '@/ui/modals'
import { AppDataGrid } from '@/ui/components'
import type { AppDataGridColumn } from '@/ui/components'
import type { FilterOption } from '@/ui/components/FilterableCardGroup/FilterableCardGroup'
import type { FieldConfig } from '@/ui/components/form'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import dayjs from 'dayjs'

import AddIcon from '@mui/icons-material/Add'

export default function SessionsRoute() {
  const { id: campaignId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [partyMembers, setPartyMembers] = useState<{ id: string; name: string }[]>([])
  const breadcrumbs = useBreadcrumbs()

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    async function load() {
      try {
        const sessionsRes = await apiFetch<{ sessions: Session[] }>('/api/sessions')
        // Filter to sessions belonging to this campaign
        const campaignSessions = (sessionsRes.sessions ?? []).filter(
          (s) => s.campaignId === campaignId,
        )
        setSessions(campaignSessions)
      } catch {
        setSessions([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [campaignId])

  // Load party members when on sessions page (so they're ready when modal opens)
  useEffect(() => {
    if (!campaignId) {
      setPartyMembers([])
      return
    }
    getPartyMembers(campaignId, (cId) =>
      apiFetch<{ characters?: import('@/domain/party').PartyMemberApiRow[] }>(
        `/api/campaigns/${cId}/party`
      )
    )
      .then((members) =>
        setPartyMembers(members.map((m) => ({ id: m._id, name: m.name })))
      )
      .catch(() => setPartyMembers([]))
  }, [campaignId])

  const openModal = () => setModalOpen(true)

  const formFields: FieldConfig[] = useMemo(() => [
    { type: 'text', name: 'title', label: 'Name' },
    { type: 'textarea', name: 'notes', label: 'Notes', rows: 3 },
    { type: 'datetime', name: 'date', label: 'Date & time', required: true },
    { type: 'visibility', name: 'visibility', label: 'Visibility', characters: partyMembers, allowHidden: false },
  ], [partyMembers])

  const defaultValues = {
    title: '',
    notes: '',
    date: dayjs().toISOString(),
    visibility: { allCharacters: true, characterIds: [] },
  }

  const handleCreate = async (data: Record<string, unknown>) => {
    if (!campaignId) return
    await apiFetch('/api/sessions', {
      method: 'POST',
      body: {
        campaignId,
        date: data.date,
        title: (data.title as string) || undefined,
        notes: (data.notes as string) || undefined,
        visibility: data.visibility,
      },
    })
    const res = await apiFetch<{ sessions: Session[] }>('/api/sessions')
    const campaignSessions = (res.sessions ?? []).filter(
      (s) => s.campaignId === campaignId,
    )
    setSessions(campaignSessions)
  }

  const columns: AppDataGridColumn<Session>[] = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 120, linkColumn: true },
    {
      field: 'date',
      headerName: 'Date & time',
      width: 180,
      valueFormatter: (value) => (value ? formatSessionDateTime(value as string) : '—'),
    },
    { field: 'status', headerName: 'Status', width: 120 },
  ]

  const statusFilterOptions: FilterOption[] = [
    { value: '', label: 'All statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <Box>
      <Breadcrumbs items={breadcrumbs} />

      <AppDataGrid<Session>
        rows={sessions}
        columns={columns}
        getRowId={(row) => row.id}
        getDetailLink={(row) =>
          ROUTES.SESSION.replace(':id', campaignId!).replace(':sessionId', row.id)
        }
        filterColumn="status"
        filterOptions={statusFilterOptions}
        filterLabel="Status"
        searchable
        searchPlaceholder="Search sessions…"
        searchColumns={['title']}
        loading={loading}
        emptyMessage="No sessions yet."
        toolbar={
          isAdmin ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openModal}>
              Create session
            </Button>
          ) : undefined
        }
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        headline="Create session"
        fields={formFields}
        defaultValues={defaultValues}
        submitLabel="Create session"
        size="standard"
      />
    </Box>
  )
}
