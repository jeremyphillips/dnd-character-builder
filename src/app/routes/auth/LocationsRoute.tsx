import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { settings, worlds } from '@/data'
import type { Location, LocationType, Visibility } from '@/data/types'
import { useAuth } from '../../providers/AuthProvider'
import { ImageUploadField, VisibilityField, VisibilityChip } from '@/ui/fields'
import { getPartyMembers } from '@/domain/party'
import { apiFetch } from '../../api'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'

import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PublicIcon from '@mui/icons-material/Public'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'

const LOCATION_TYPE_OPTIONS: { value: LocationType; label: string }[] = [
  { value: 'region', label: 'Region' },
  { value: 'city', label: 'City' },
  { value: 'town', label: 'Town' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'landmark', label: 'Landmark' },
  { value: 'other', label: 'Other' },
]

const FILTER_OPTIONS: { value: LocationType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  ...LOCATION_TYPE_OPTIONS,
]

const TYPE_COLORS: Record<LocationType, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
  region: 'primary',
  city: 'secondary',
  town: 'success',
  dungeon: 'error',
  landmark: 'warning',
  other: 'info',
}

const DEFAULT_VISIBILITY: Visibility = { allCharacters: false, characterIds: [] }

interface LocationOverride {
  name?: string
  type?: string
  description?: string
  imageUrl?: string | null
  visibility?: Visibility
}

function getWorldForSetting(settingId: string) {
  const setting = settings.find((s) => s.id === settingId)
  if (!setting) return null
  const worldId = setting.worldIds?.[0] ?? setting.worldId?.[0] ?? setting.worlds?.[0]
  if (!worldId) return null
  return worlds.find((w: { id: string; name: string }) => w.id === worldId) ?? null
}

function getSettingLocations(settingId: string): Location[] {
  const setting = settings.find((s) => s.id === settingId)
  return setting?.locations ?? []
}

function applyOverrides(
  dataLocations: Location[],
  overrides: Record<string, LocationOverride>
): Location[] {
  return dataLocations.map((loc) => {
    const o = overrides[loc.id]
    if (!o) return loc
    return {
      ...loc,
      name: o.name ?? loc.name,
      type: (o.type as LocationType) ?? loc.type,
      description: o.description ?? loc.description,
      imageUrl: o.imageUrl === null ? undefined : (o.imageUrl ?? loc.imageUrl),
      visibility: o.visibility ?? loc.visibility,
    }
  })
}

async function fetchSettingData(
  settingId: string
): Promise<{
  worldMapUrl?: string | null
  locations?: Location[]
  customLocations?: Location[]
  locationOverrides?: Record<string, LocationOverride>
} | null> {
  try {
    return await apiFetch(`/api/setting-data/${settingId}`)
  } catch {
    return null
  }
}

async function apiSaveWorldMap(settingId: string, worldMapUrl: string | null) {
  await apiFetch(`/api/setting-data/${settingId}/world-map`, {
    method: 'PATCH',
    body: { worldMapUrl },
  })
}

async function apiCreateLocation(settingId: string, location: Location) {
  await apiFetch(`/api/setting-data/${settingId}/locations`, {
    method: 'POST',
    body: location,
  })
}

async function apiUpdateLocation(settingId: string, locationId: string, updates: Record<string, unknown>) {
  await apiFetch(`/api/setting-data/${settingId}/locations/${locationId}`, {
    method: 'PATCH',
    body: updates,
  })
}

export default function LocationsRoute() {
  const { id: campaignId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'superadmin'

  const [campaign, setCampaign] = useState<{ identity?: { setting?: string } } | null>(null)
  const [campaignLoading, setCampaignLoading] = useState(true)
  const activeSetting = campaign?.identity?.setting ?? ''
  const world = getWorldForSetting(activeSetting)

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<LocationType | 'all'>('all')
  const [worldMapUrl, setWorldMapUrl] = useState<string | null>(null)
  const [customLocations, setCustomLocations] = useState<Location[]>([])
  const [locationOverrides, setLocationOverrides] = useState<Record<string, LocationOverride>>({})
  const [worldDragActive, setWorldDragActive] = useState(false)
  const [worldLightbox, setWorldLightbox] = useState(false)
  const worldFileRef = useRef<HTMLInputElement>(null)
  const [editLocation, setEditLocation] = useState<Location | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState<LocationType>('other')
  const [editDescription, setEditDescription] = useState('')
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null)
  const [editVisibility, setEditVisibility] = useState<Visibility>(DEFAULT_VISIBILITY)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<LocationType>('other')
  const [newDescription, setNewDescription] = useState('')
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null)
  const [newVisibility, setNewVisibility] = useState<Visibility>(DEFAULT_VISIBILITY)
  const [partyMembers, setPartyMembers] = useState<{ id: string; name: string }[]>([])

  // Load party members for VisibilityField character selection
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

  useEffect(() => {
    if (!campaignId) {
      setCampaignLoading(false)
      return
    }
    let cancelled = false
    setCampaignLoading(true)
    apiFetch<{ campaign?: { identity?: { setting?: string } } }>(`/api/campaigns/${campaignId}`)
      .then((data) => {
        if (!cancelled && data.campaign) setCampaign({ identity: data.campaign.identity })
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCampaignLoading(false)
      })
    return () => { cancelled = true }
  }, [campaignId])

  useEffect(() => {
    if (!campaignId || !activeSetting) {
      setLoading(true)
      return
    }
    let cancelled = false
    async function load() {
      try {
        const data = await fetchSettingData(activeSetting)
        if (cancelled || !data) return
        setWorldMapUrl(data.worldMapUrl ?? null)
        setCustomLocations(data.customLocations ?? [])
        setLocationOverrides(data.locationOverrides ?? {})
      } catch (err) {
        console.error('Failed to load setting data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [campaignId, activeSetting])

  const dataLocations = useMemo(() => getSettingLocations(activeSetting), [activeSetting])
  const mergedDataLocations = useMemo(
    () => applyOverrides(dataLocations, locationOverrides),
    [dataLocations, locationOverrides]
  )
  const allLocations = useMemo(
    () => [...mergedDataLocations, ...customLocations],
    [mergedDataLocations, customLocations]
  )
  const filtered = useMemo(() => {
    return allLocations.filter((loc) => {
      const matchesType = typeFilter === 'all' || loc.type === typeFilter
      const matchesSearch = !search || loc.name.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [allLocations, search, typeFilter])

  const uploadWorldMap = useCallback(async (file: File) => {
    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        credentials: 'include',
        body: file,
      })
      if (res.ok) {
        const data = await res.json()
        setWorldMapUrl(data.url)
        await apiSaveWorldMap(activeSetting, data.url)
      }
    } catch (err) {
      console.error('World map upload failed:', err)
    }
  }, [activeSetting])

  const removeWorldMap = useCallback(async () => {
    setWorldMapUrl(null)
    await apiSaveWorldMap(activeSetting, null)
  }, [activeSetting])

  const handleWorldDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWorldDragActive(true)
  }, [])

  const handleWorldDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWorldDragActive(false)
  }, [])

  const handleWorldDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWorldDragActive(false)
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'))
    if (file) uploadWorldMap(file)
  }, [uploadWorldMap])

  const handleWorldFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadWorldMap(file)
    e.target.value = ''
  }, [uploadWorldMap])

  function openEdit(loc: Location) {
    setEditLocation(loc)
    setEditName(loc.name)
    setEditType(loc.type)
    setEditDescription(loc.description ?? '')
    setEditImageUrl(loc.imageUrl ?? null)
    setEditVisibility(loc.visibility)
  }

  function closeEdit() {
    setEditLocation(null)
  }

  async function saveEdit() {
    if (!editLocation) return
    const updates = {
      name: editName,
      type: editType,
      description: editDescription,
      imageUrl: editImageUrl,
      visibility: editVisibility,
      isCustom: !!editLocation.isCustom,
    }
    try {
      await apiUpdateLocation(activeSetting, editLocation.id, updates)
      if (editLocation.isCustom) {
        setCustomLocations((prev) =>
          prev.map((l) =>
            l.id === editLocation.id
              ? { ...l, name: editName, type: editType, description: editDescription, imageUrl: editImageUrl ?? undefined, visibility: editVisibility }
              : l
          )
        )
      } else {
        setLocationOverrides((prev) => ({
          ...prev,
          [editLocation.id]: {
            name: editName,
            type: editType,
            description: editDescription,
            imageUrl: editImageUrl,
            visibility: editVisibility,
          },
        }))
      }
    } catch (err) {
      console.error('Failed to save location:', err)
    }
    closeEdit()
  }

  function openCreate() {
    setNewName('')
    setNewType('other')
    setNewDescription('')
    setNewImageUrl(null)
    setNewVisibility(DEFAULT_VISIBILITY)
    setShowCreateForm(true)
  }

  async function saveCreate() {
    if (!newName) return
    const newLoc: Location = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      settingId: activeSetting,
      name: newName,
      type: newType,
      description: newDescription || undefined,
      imageUrl: newImageUrl ?? undefined,
      visibility: newVisibility,
      isCustom: true,
    }
    try {
      await apiCreateLocation(activeSetting, newLoc)
      setCustomLocations((prev) => [...prev, newLoc])
    } catch (err) {
      console.error('Failed to create location:', err)
    }
    setShowCreateForm(false)
  }

  if (!campaignId) {
    return (
      <Typography color="text.secondary">No campaign selected.</Typography>
    )
  }

  if (campaignLoading || (!campaign && loading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!campaign?.identity?.setting) {
    return (
      <Typography color="text.secondary">Campaign has no setting configured.</Typography>
    )
  }

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
        <Typography variant="h4">Locations</Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Location
          </Button>
        )}
      </Stack>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <PublicIcon color="primary" />
            <Typography variant="h6">{world?.name ?? 'Unknown World'}</Typography>
            <Chip label="World" size="small" variant="outlined" color="primary" />
          </Stack>

          {worldMapUrl ? (
            <Box>
              <Box
                component="img"
                src={worldMapUrl}
                alt={`${world?.name ?? 'World'} map`}
                onClick={() => setWorldLightbox(true)}
                sx={{
                  width: '100%',
                  maxHeight: 420,
                  objectFit: 'contain',
                  borderRadius: 1,
                  border: '1px solid var(--mui-palette-divider)',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                  '&:hover': { opacity: 0.85 },
                }}
              />
              {canEdit && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => worldFileRef.current?.click()}>
                    Replace Image
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={removeWorldMap}>
                    Remove
                  </Button>
                </Box>
              )}
              <input ref={worldFileRef} type="file" accept="image/*" onChange={handleWorldFileSelect} style={{ display: 'none' }} />
              <Dialog
                open={worldLightbox}
                onClose={() => setWorldLightbox(false)}
                maxWidth={false}
                slotProps={{
                  paper: {
                    sx: { bgcolor: 'transparent', boxShadow: 'none', maxWidth: '90vw', maxHeight: '90vh', overflow: 'visible' },
                  },
                }}
              >
                <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton
                    onClick={() => setWorldLightbox(false)}
                    sx={{
                      position: 'absolute', top: -16, right: -16,
                      bgcolor: 'var(--mui-palette-background-paper)', boxShadow: 2,
                      '&:hover': { bgcolor: 'var(--mui-palette-action-hover)' },
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Box
                    component="img"
                    src={worldMapUrl}
                    alt={`${world?.name ?? 'World'} map`}
                    sx={{ maxWidth: '85vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 1 }}
                  />
                </DialogContent>
              </Dialog>
            </Box>
          ) : (
            <Card
              variant="outlined"
              onDragOver={canEdit ? handleWorldDragOver : undefined}
              onDragLeave={canEdit ? handleWorldDragLeave : undefined}
              onDrop={canEdit ? handleWorldDrop : undefined}
              onClick={canEdit ? () => worldFileRef.current?.click() : undefined}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                cursor: canEdit ? 'pointer' : 'default',
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: worldDragActive ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-divider)',
                bgcolor: worldDragActive ? 'var(--mui-palette-primary-main)14' : 'transparent',
                transition: 'border-color 0.2s, background-color 0.2s',
                ...(canEdit && {
                  '&:hover': {
                    borderColor: 'var(--mui-palette-primary-light)',
                    bgcolor: 'var(--mui-palette-action-hover)',
                  },
                }),
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: worldDragActive ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-text-secondary)' }} />
              {canEdit ? (
                <>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {worldDragActive ? 'Drop map image here' : 'Upload a world map'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Drag & drop or click to browse — PNG, JPG, WEBP
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">No world map uploaded yet.</Typography>
              )}
              <input ref={worldFileRef} type="file" accept="image/*" onChange={handleWorldFileSelect} style={{ display: 'none' }} />
            </Card>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search locations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 260 }}
        />
        <TextField
          select
          size="small"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as LocationType | 'all')}
          sx={{ minWidth: 160 }}
        >
          {FILTER_OPTIONS.map((t) => (
            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {filtered.length === 0 ? (
        <Typography color="text.secondary">No locations found.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map((loc) => (
            <Card key={loc.id} variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                {loc.imageUrl && (
                  <Box
                    component="img"
                    src={loc.imageUrl}
                    alt={loc.name}
                    sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                  />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>{loc.name}</Typography>
                    {loc.isCustom && <Chip label="Custom" size="small" variant="outlined" color="info" />}
                  </Stack>
                  {loc.parentLocationId && (
                    <Typography variant="caption" color="text.secondary">
                      Inside: {allLocations.find((l) => l.id === loc.parentLocationId)?.name ?? loc.parentLocationId}
                    </Typography>
                  )}
                </Box>
                <Chip label={loc.type} size="small" color={TYPE_COLORS[loc.type]} variant="outlined" sx={{ textTransform: 'capitalize' }} />
                <VisibilityChip visibility={loc.visibility} />
                {canEdit ? (
                  <IconButton size="small" onClick={() => openEdit(loc)} aria-label={`Edit ${loc.name}`}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <Button size="small" variant="text" onClick={() => openEdit(loc)}>View</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={!!editLocation} onClose={closeEdit} maxWidth="sm" fullWidth>
        {editLocation && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={closeEdit} sx={{ mr: 0.5 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              {canEdit ? 'Edit Location' : 'Location Details'}
              <Chip
                label={canEdit ? editType : editLocation.type}
                size="small"
                color={TYPE_COLORS[canEdit ? editType : editLocation.type]}
                variant="outlined"
                sx={{ ml: 'auto', textTransform: 'capitalize' }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2.5}>
                <ImageUploadField value={editImageUrl} onChange={setEditImageUrl} label="Image" disabled={!canEdit} maxHeight={200} />
                {canEdit ? (
                  <TextField label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} size="small" fullWidth />
                ) : (
                  <Box>
                    <Typography variant="overline" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{editLocation.name}</Typography>
                  </Box>
                )}
                {canEdit ? (
                  <TextField select label="Type" value={editType} onChange={(e) => setEditType(e.target.value as LocationType)} size="small" fullWidth>
                    {LOCATION_TYPE_OPTIONS.map((t) => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Box>
                    <Typography variant="overline" color="text.secondary">Type</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{editLocation.type}</Typography>
                  </Box>
                )}
                {canEdit ? (
                  <TextField label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} size="small" fullWidth multiline minRows={3} />
                ) : (
                  <Box>
                    <Typography variant="overline" color="text.secondary">Description</Typography>
                    <Typography variant="body1" color={editLocation.description ? 'text.primary' : 'text.disabled'}>
                      {editLocation.description || 'No description available.'}
                    </Typography>
                  </Box>
                )}
                {editLocation.parentLocationId && (
                  <Box>
                    <Typography variant="overline" color="text.secondary">Parent Location</Typography>
                    <Typography variant="body1">
                      {allLocations.find((l) => l.id === editLocation.parentLocationId)?.name ?? editLocation.parentLocationId}
                    </Typography>
                  </Box>
                )}
                <VisibilityField value={canEdit ? editVisibility : editLocation.visibility} onChange={setEditVisibility} disabled={!canEdit} characters={partyMembers} />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeEdit}>{canEdit ? 'Cancel' : 'Close'}</Button>
              {canEdit && (
                <Button variant="contained" onClick={saveEdit} disabled={!editName}>Save</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={showCreateForm} onClose={() => setShowCreateForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Location</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <ImageUploadField value={newImageUrl} onChange={setNewImageUrl} label="Image" maxHeight={200} />
            <TextField label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} size="small" fullWidth required autoFocus />
            <TextField select label="Type" value={newType} onChange={(e) => setNewType(e.target.value as LocationType)} size="small" fullWidth>
              {LOCATION_TYPE_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} size="small" fullWidth multiline minRows={3} placeholder="Describe this location…" />
            <VisibilityField value={newVisibility} onChange={setNewVisibility} characters={partyMembers} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCreate} disabled={!newName}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
