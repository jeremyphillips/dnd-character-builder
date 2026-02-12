import { useState, useEffect } from 'react'
import { useAuth } from '../../providers/AuthProvider'
import { apiFetch } from '../../api'
import { getPartyMembers } from '@/domain/party'
import type { PartyMember } from '@/domain/party'
import { PartyCardGroup } from '@/ui/components'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'

import GroupIcon from '@mui/icons-material/Group'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Campaign {
  _id: string
  name: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PartyRoute() {
  useAuth()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
  const [characters, setCharacters] = useState<PartyMember[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [loadingParty, setLoadingParty] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Load campaigns ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<{ campaigns: Campaign[] }>('/api/campaigns')
        const list = data.campaigns ?? []
        setCampaigns(list)

        // Auto-select first campaign
        if (list.length > 0) {
          setSelectedCampaignId(list[0]._id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaigns')
      } finally {
        setLoadingCampaigns(false)
      }
    }
    load()
  }, [])

  // ── Load party when campaign changes ────────────────────────────────
  useEffect(() => {
    if (!selectedCampaignId) {
      setCharacters([])
      return
    }

    async function loadParty() {
      setLoadingParty(true)
      setError(null)
      try {
        const members = await getPartyMembers(selectedCampaignId, (campaignId) =>
          apiFetch<{ characters?: import('@/domain/party').PartyMemberApiRow[] }>(
            `/api/campaigns/${campaignId}/party`
          )
        )
        setCharacters(members)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load party')
      } finally {
        setLoadingParty(false)
      }
    }
    loadParty()
  }, [selectedCampaignId])

  // ── Render ──────────────────────────────────────────────────────────
  if (loadingCampaigns) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <GroupIcon color="primary" fontSize="large" />
        <Typography variant="h4">Party</Typography>
      </Stack>

      {/* Campaign selector */}
      {campaigns.length === 0 ? (
        <Alert severity="info">You are not part of any campaigns yet.</Alert>
      ) : (
        <TextField
          select
          label="Campaign"
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          sx={{ mb: 3, minWidth: 300 }}
          size="small"
        >
          {campaigns.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Party characters */}
      {loadingParty ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : characters.length === 0 && selectedCampaignId ? (
        <Alert severity="info">No characters in this campaign's party yet.</Alert>
      ) : (
        <PartyCardGroup characters={characters} />
      )}
    </Box>
  )
}
