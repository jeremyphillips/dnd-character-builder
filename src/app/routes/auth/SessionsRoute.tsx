import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { apiFetch } from '../../api'
import { ROUTES } from '../../routes'
import type { Session } from '@/domain/session'
import { formatSessionDateTime } from '@/domain/session'
import { getPartyMembers } from '@/domain/party'
import type { Visibility } from '@/data/types'
import { VisibilityField } from '@/ui/fields'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

import AddIcon from '@mui/icons-material/Add'

export default function SessionsRoute() {
  const { id: campaignId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formDateTime, setFormDateTime] = useState<Dayjs | null>(dayjs())
  const [formVisibility, setFormVisibility] = useState<Visibility>({ allCharacters: true, characterIds: [] })
  const [partyMembers, setPartyMembers] = useState<{ id: string; name: string }[]>([])

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

  const openModal = () => {
    setFormTitle('')
    setFormNotes('')
    setFormDateTime(dayjs())
    setFormVisibility({ allCharacters: true, characterIds: [] })
    setModalOpen(true)
  }

  const handleCreate = async () => {
    if (!formDateTime || !campaignId) return
    setCreating(true)
    try {
      await apiFetch('/api/sessions', {
        method: 'POST',
        body: {
          campaignId,
          date: formDateTime.toISOString(),
          title: formTitle || undefined,
          notes: formNotes || undefined,
          visibility: formVisibility,
        },
      })
      setModalOpen(false)
      const data = await apiFetch<{ sessions: Session[] }>('/api/sessions')
      const campaignSessions = (data.sessions ?? []).filter(
        (s) => s.campaignId === campaignId,
      )
      setSessions(campaignSessions)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setCreating(false)
    }
  }

  const columns: GridColDef<Session>[] = [
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 120 },
    {
      field: 'date',
      headerName: 'Date & time',
      width: 180,
      valueFormatter: (value) => (value ? formatSessionDateTime(value as string) : '—'),
    },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'id',
      headerName: ' ',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          size="small"
          href={ROUTES.SESSION.replace(':id', campaignId!).replace(':sessionId', params.value as string)}
        >
          View
        </Button>
      ),
    },
  ]

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Sessions</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openModal}>
            Create session
          </Button>
        )}
      </Box>

      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={sessions}
          columns={columns}
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create session</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Notes"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            size="small"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date & time"
              value={formDateTime}
              onChange={(v) => setFormDateTime(v)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
          <VisibilityField
            value={formVisibility}
            onChange={setFormVisibility}
            allowHidden={false}
            defaultValue={{ allCharacters: true, characterIds: [] }}
            characters={partyMembers}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating || !formDateTime || !campaignId}
          >
            {creating ? 'Creating…' : 'Create session'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
