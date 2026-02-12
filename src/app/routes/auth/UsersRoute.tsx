import { useState, useEffect, useCallback } from 'react'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { apiFetch, ApiError } from '../../api'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import PersonAddIcon from '@mui/icons-material/PersonAdd'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface UserRow {
  id: string
  username: string
  email: string
  role: string
  campaignCount: number
  characterCount: number
}

const ROLES = ['superadmin', 'admin', 'user'] as const

function roleColor(role: string): 'error' | 'warning' | 'default' {
  if (role === 'superadmin') return 'error'
  if (role === 'admin') return 'warning'
  return 'default'
}

// ---------------------------------------------------------------------------
// DataGrid columns
// ---------------------------------------------------------------------------
const columns: GridColDef<UserRow>[] = [
  { field: 'username', headerName: 'Name', flex: 1, minWidth: 140 },
  { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
  {
    field: 'role',
    headerName: 'Role',
    width: 130,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color={roleColor(params.value)}
        sx={{ textTransform: 'capitalize' }}
      />
    ),
  },
  { field: 'campaignCount', headerName: 'Campaigns', width: 110, type: 'number' },
  { field: 'characterCount', headerName: 'Characters', width: 110, type: 'number' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function UsersRoute() {
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create-user modal
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>('user')

  // ── Fetch users ──────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<{
        users: { _id?: string; id?: string; username: string; email: string; role: string; campaignCount?: number; characterCount?: number }[]
      }>('/api/users')
      setRows(
        (data.users ?? []).map((u) => ({
          id: u._id ?? u.id ?? '',
          username: u.username,
          email: u.email,
          role: u.role,
          campaignCount: u.campaignCount ?? 0,
          characterCount: u.characterCount ?? 0,
        })),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Create user ──────────────────────────────────────────────────────
  function openCreate() {
    setUsername('')
    setEmail('')
    setPassword('')
    setRole('user')
    setFormError(null)
    setOpen(true)
  }

  async function handleCreate() {
    if (!username || !email || !password) {
      setFormError('All fields are required')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: { username, email, password, role },
      })
      setOpen(false)
      fetchUsers()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4">Users</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openCreate}>
          Add User
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          sx={{
            border: '1px solid var(--mui-palette-divider)',
            borderRadius: 1,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'var(--mui-palette-action-hover)',
            },
          }}
        />
      </Box>

      {/* ──────────────────────────────────────────────────────────────── */}
      {/* Create-user dialog                                               */}
      {/* ──────────────────────────────────────────────────────────────── */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            select
            fullWidth
          >
            {ROLES.map((r) => (
              <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
