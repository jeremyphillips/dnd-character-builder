import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import { useNotifications } from '../../providers/NotificationProvider'
import { apiFetch } from '../../api'
import type { Session } from '@/domain/session'
import { formatSessionDateTime } from '@/domain/session'
import type { AppNotification } from '@/domain/notification'
import {
  EditableTextField,
  EditableSelect,
} from '@/ui/forms'
import EditableField from '@/ui/forms/EditableField/EditableField'
import { InviteConfirmationBox } from '@/ui/components'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs, { type Dayjs } from 'dayjs'
import SaveIcon from '@mui/icons-material/Save'

const STATUS_OPTIONS = [
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
]

function SessionDateEdit({
  value,
  onSave,
  onClose,
  saving,
}: {
  value: string
  onSave: (v: string) => void
  onClose: () => void
  saving: boolean
}) {
  const [local, setLocal] = useState<Dayjs | null>(() => dayjs(value))
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, flexWrap: 'wrap', width: '100%' }}>
        <DateTimePicker
          value={local}
          onChange={setLocal}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
        <Button
          size="small"
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => local && onSave(local.toISOString())}
          disabled={saving}
        >
          {saving ? '…' : 'Save'}
        </Button>
        <Button size="small" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </LocalizationProvider>
  )
}

export default function SessionRoute() {
  const { sessionId } = useParams<{ id: string; sessionId: string }>()
  const { user } = useAuth()
  const { notifications, markAsRead, refresh: refreshNotifications } = useNotifications()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Find a pending session.invite notification for this session
  const sessionInvite: AppNotification | undefined = notifications.find(
    (n) =>
      n.type === 'session.invite' &&
      n.context.type === 'sessionInvite' &&
      n.context.sessionInviteId === sessionId &&
      !n.actionTakenAt,
  )

  useEffect(() => {
    if (!sessionId) return
    setLoading(true)
    apiFetch<{ session: Session }>(`/api/sessions/${sessionId}`)
      .then((data) => setSession(data.session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [sessionId])

  const saveSession = async (partial: Partial<Session>) => {
    if (!sessionId) return
    const data = await apiFetch<{ session: Session }>(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      body: partial,
    })
    setSession(data.session)
  }

  async function handleSessionInviteRespond(_action: 'accept' | 'decline') {
    if (!sessionInvite) return
    setResponding(true)
    try {
      await markAsRead(sessionInvite._id)
      await refreshNotifications()
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">Session not found.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {sessionInvite && (
        <InviteConfirmationBox
          headline="Session Invite"
          description={sessionInvite.payload.sessionNotes as string | undefined}
          subtitle={formatSessionDateTime(sessionInvite.payload.sessionDate as string)}
          detailTitle={sessionInvite.payload.sessionTitle as string | undefined}
          status="pending"
          responding={responding}
          onRespond={handleSessionInviteRespond}
        />
      )}

      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Session
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              ID
            </Typography>
            <Typography variant="body1">{session.id}</Typography>
          </Box>

          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Campaign ID
            </Typography>
            <Typography variant="body1">{session.campaignId}</Typography>
          </Box>

          <EditableTextField
            label="Title"
            value={session.title ?? ''}
            onSave={(v: string) => saveSession({ title: v })}
            disabled={!isAdmin}
          />

          <EditableTextField
            label="Notes"
            value={session.notes ?? ''}
            onSave={(v: string) => saveSession({ notes: v })}
            disabled={!isAdmin}
            multiline
            minRows={3}
          />

          {isAdmin ? (
            <EditableField<string>
              label="Date & time"
              value={session.date}
              onSave={async (v) => saveSession({ date: v })}
              renderDisplay={() => formatSessionDateTime(session.date)}
              renderEdit={({ value, onSave, onClose, saving }) => (
                <SessionDateEdit
                  value={value}
                  onSave={onSave}
                  onClose={onClose}
                  saving={saving}
                />
              )}
            />
          ) : (
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                Date & time
              </Typography>
              <Typography variant="body1">{formatSessionDateTime(session.date)}</Typography>
            </Box>
          )}

          <EditableSelect
            label="Status"
            value={session.status}
            onSave={(v: string) => saveSession({ status: v as Session['status'] })}
            options={STATUS_OPTIONS}
            disabled={!isAdmin}
          />
        </CardContent>
      </Card>
    </Box>
  )
}
