import { useState, useEffect } from 'react'
import type { Visibility } from '@/data/types'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import LockIcon from '@mui/icons-material/Lock'

const DEFAULT_VISIBILITY_HIDDEN: Visibility = { allCharacters: false, characterIds: [] }

interface VisibilityFieldProps {
  /** Current visibility value */
  value: Visibility
  /** Called when visibility changes */
  onChange: (visibility: Visibility) => void
  /** Whether the field is editable */
  disabled?: boolean
  /** Available characters for "selected" mode. Keys are IDs, values are names. */
  characters?: { id: string; name: string }[]
  /** When false, hide the "Hidden (admin only)" option. Default true. */
  allowHidden?: boolean
  /** Default visibility when not specified by parent (e.g. for form reset). Default is hidden. */
  defaultValue?: Visibility
}

type VisibilityMode = 'hidden' | 'all' | 'selected'

function getMode(v: Visibility): VisibilityMode {
  if (v.allCharacters) return 'all'
  if (v.characterIds.length > 0) return 'selected'
  return 'hidden'
}

/**
 * Reusable visibility rules field.
 *
 * Rules:
 * - Default: hidden (allCharacters: false, characterIds: [])
 * - Admin chooses: All characters, Selected characters, or Hidden
 * - Admins always bypass visibility (enforced at the API layer)
 */
export default function VisibilityField({
  value,
  onChange,
  disabled = false,
  characters = [],
  allowHidden = true,
  defaultValue: _defaultValue = DEFAULT_VISIBILITY_HIDDEN,
}: VisibilityFieldProps) {
  // Local mode state so "selected with 0 characters" doesn't snap back to "hidden"
  const [mode, setMode] = useState<VisibilityMode>(() => getMode(value))

  // Sync from parent when it changes to a clearly distinguishable mode
  useEffect(() => {
    const parentMode = getMode(value)
    if (parentMode === 'all' || parentMode === 'selected') {
      setMode(parentMode)
    }
    // When parent resets to hidden AND we're not holding "selected" open
    if (parentMode === 'hidden' && mode !== 'selected') {
      setMode('hidden')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.allCharacters, value.characterIds.length])

  function handleModeChange(newMode: VisibilityMode) {
    setMode(newMode)
    switch (newMode) {
      case 'all':
        onChange({ allCharacters: true, characterIds: [] })
        break
      case 'selected':
        onChange({ allCharacters: false, characterIds: value.characterIds })
        break
      case 'hidden':
      default:
        onChange({ allCharacters: false, characterIds: [] })
        break
    }
  }

  function toggleCharacter(charId: string) {
    const current = new Set(value.characterIds)
    if (current.has(charId)) {
      current.delete(charId)
    } else {
      current.add(charId)
    }
    onChange({ allCharacters: false, characterIds: Array.from(current) })
  }

  // Read-only display
  if (disabled) {
    return (
      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          Visibility
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {mode === 'all' && (
            <>
              <VisibilityIcon fontSize="small" color="success" />
              <Typography variant="body2">Visible to all characters</Typography>
            </>
          )}
          {mode === 'selected' && (
            <>
              <LockIcon fontSize="small" color="warning" />
              <Typography variant="body2">
                Visible to {value.characterIds.length} character{value.characterIds.length !== 1 ? 's' : ''}
              </Typography>
            </>
          )}
          {mode === 'hidden' && (
            <>
              <VisibilityOffIcon fontSize="small" color="error" />
              <Typography variant="body2">Hidden (admin only)</Typography>
            </>
          )}
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ display: 'block', mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        Visibility
      </Typography>

      <RadioGroup
        value={mode}
        onChange={(e) => handleModeChange(e.target.value as VisibilityMode)}
      >
        {allowHidden && (
          <FormControlLabel
            value="hidden"
            control={<Radio size="small" />}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <VisibilityOffIcon fontSize="small" />
                <Typography variant="body2">Hidden (admin only)</Typography>
              </Stack>
            }
          />
        )}
        <FormControlLabel
          value="all"
          control={<Radio size="small" />}
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <VisibilityIcon fontSize="small" />
              <Typography variant="body2">All characters</Typography>
            </Stack>
          }
        />
        <FormControlLabel
          value="selected"
          control={<Radio size="small" />}
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <LockIcon fontSize="small" />
              <Typography variant="body2" color={characters.length === 0 ? 'text.disabled' : 'text.primary'}>
                Selected characters{characters.length === 0 ? ' (none in campaign)' : ''}
              </Typography>
            </Stack>
          }
        />
      </RadioGroup>

      {mode === 'selected' && (
        <Box sx={{ mt: 1, pl: 4 }}>
          {characters.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No characters available to select.
            </Typography>
          ) : (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {characters.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  size="small"
                  variant={value.characterIds.includes(c.id) ? 'filled' : 'outlined'}
                  color={value.characterIds.includes(c.id) ? 'primary' : 'default'}
                  onClick={() => toggleCharacter(c.id)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  )
}

/**
 * Simple read-only chip for displaying visibility state inline.
 */
export function VisibilityChip({ visibility }: { visibility: Visibility }) {
  if (visibility.allCharacters) {
    return <Chip icon={<VisibilityIcon />} label="Visible" size="small" color="success" variant="outlined" />
  }
  if (visibility.characterIds.length > 0) {
    return <Chip icon={<LockIcon />} label="Restricted" size="small" color="warning" variant="outlined" />
  }
  return <Chip icon={<VisibilityOffIcon />} label="Hidden" size="small" color="error" variant="outlined" />
}
