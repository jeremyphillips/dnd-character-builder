import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import GroupIcon from '@mui/icons-material/Group'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InviteConfirmationBoxProps {
  /** Primary heading shown at the top of the card (e.g. "Campaign Invite", "Session Invite") */
  headline: string
  /** Secondary text rendered below the headline */
  invitedByLabel?: string
  /** Optional description rendered above the subtitle card */
  description?: ReactNode
  /** Optional subtitle rendered above the detail card */
  subtitle?: ReactNode
  /** Detail card content — campaign/session preview chips & text */
  detailTitle?: string
  detailChips?: { label: string; color?: 'default' | 'primary' }[]
  detailDescription?: string
  /** Invite status */
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  /** Whether an accept/decline request is in flight */
  responding?: boolean
  /** Called when the user clicks Accept or Decline */
  onRespond?: (action: 'accept' | 'decline') => void
  /** Character options for accept (value: characterId, label: display string). Only shown when pending. */
  characterOptions?: { value: string; label: string }[]
  /** Message explaining character restriction (e.g. setting requirement). Shown above character select when pending. */
  characterRestrictionMessage?: string
  /** Selected character ID when accepting */
  selectedCharacterId?: string
  /** Called when user selects a character */
  onCharacterChange?: (characterId: string) => void
  /** Link shown in the accepted alert (e.g. navigate to campaign) */
  acceptedLink?: { to: string; label: string }
  /** Accepted alert message */
  acceptedMessage?: string
  /** Declined alert message */
  declinedMessage?: string
  /** Footer text (e.g. date sent) */
  footer?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const InviteConfirmationBox = ({
  headline,
  invitedByLabel,
  description,
  subtitle,
  detailTitle,
  detailChips,
  detailDescription,
  status,
  responding = false,
  onRespond,
  acceptedLink,
  acceptedMessage = 'You have accepted this invite!',
  declinedMessage = 'You have declined this invite.',
  footer,
  characterOptions = [],
  characterRestrictionMessage,
  selectedCharacterId = '',
  onCharacterChange,
}: InviteConfirmationBoxProps) => {
  const isPending = status === 'pending'
  const isAccepted = status === 'accepted'
  const isDeclined = status === 'declined'

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', mt: 4 }}>
      <Card variant="outlined">
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <GroupIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {headline}
              </Typography>
              {invitedByLabel && (
                <Typography variant="body2" color="text.secondary">
                  {invitedByLabel}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Description — rendered above subtitle */}
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}

          {/* Subtitle — rendered above the detail card */}
          {subtitle && (
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              {subtitle}
            </Typography>
          )}

          {/* Detail preview card */}
          {detailTitle && (
            <Card
              variant="outlined"
              sx={{
                mb: 3,
                bgcolor: 'var(--mui-palette-action-hover)',
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  {detailTitle}
                </Typography>

                {detailChips && detailChips.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
                    {detailChips.map((chip) => (
                      <Chip
                        key={chip.label}
                        label={chip.label}
                        size="small"
                        color={chip.color ?? 'default'}
                        variant={chip.color === 'primary' ? 'filled' : 'outlined'}
                        sx={chip.color === 'primary' ? { textTransform: 'capitalize' } : undefined}
                      />
                    ))}
                  </Stack>
                )}

                {detailDescription && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {detailDescription}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Character select — only when pending and options provided */}
          {isPending && (characterOptions.length > 0 || characterRestrictionMessage) && (
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              {characterRestrictionMessage && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {characterRestrictionMessage}
                </Typography>
              )}
              <FormLabel sx={{ mb: 1, fontSize: '0.75rem' }}>Character to join with</FormLabel>
              <Select
                value={selectedCharacterId}
                onChange={(e) => onCharacterChange?.(e.target.value)}
                displayEmpty
                disabled={characterOptions.length === 0}
                renderValue={(v) => characterOptions.find((o) => o.value === v)?.label ?? (characterOptions.length === 0 ? 'No characters for this setting' : 'Select a character')}
                sx={{ fontSize: '0.9rem' }}
              >
                {characterOptions.length === 0 ? (
                  <MenuItem disabled>No characters for this setting</MenuItem>
                ) : (
                  characterOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}

          {/* Status / Actions */}
          {isPending && onRespond && (
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => onRespond('decline')}
                disabled={responding}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={() => onRespond('accept')}
                disabled={responding || (characterOptions.length === 0 || !selectedCharacterId)}
              >
                {responding ? 'Processing…' : 'Accept Invite'}
              </Button>
            </Stack>
          )}

          {isAccepted && (
            <Alert
              severity="success"
              action={
                acceptedLink ? (
                  <Button
                    component={Link}
                    to={acceptedLink.to}
                    color="inherit"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                  >
                    {acceptedLink.label}
                  </Button>
                ) : undefined
              }
            >
              {acceptedMessage}
            </Alert>
          )}

          {isDeclined && (
            <Alert severity="info">{declinedMessage}</Alert>
          )}

          {status === 'expired' && (
            <Alert severity="warning">This invite has expired.</Alert>
          )}

          {/* Footer */}
          {footer && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'right' }}>
              {footer}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default InviteConfirmationBox
