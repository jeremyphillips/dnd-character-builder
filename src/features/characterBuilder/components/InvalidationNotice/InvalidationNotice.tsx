import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface InvalidationNoticeProps {
  /** Human-readable names of items that were removed. */
  items: string[]
  /** Called when the user dismisses the notice. */
  onDismiss: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A dismissible warning banner displayed at the top of a builder step
 * when a previous change invalidated selections in this step.
 *
 * Usage:
 * ```tsx
 * const { stepNotices, dismissNotice } = useCharacterBuilder()
 * const notices = stepNotices.get('spells') ?? []
 *
 * {notices.length > 0 && (
 *   <InvalidationNotice items={notices} onDismiss={() => dismissNotice('spells')} />
 * )}
 * ```
 */
const InvalidationNotice = ({ items, onDismiss }: InvalidationNoticeProps) => {
  if (items.length === 0) return null

  return (
    <Alert severity="warning" onClose={onDismiss} sx={{ mb: 2 }}>
      <AlertTitle>Selections updated</AlertTitle>
      The following were removed because they are no longer valid:
      <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
        {items.map((name) => (
          <li key={name}>
            <Typography variant="body2">{name}</Typography>
          </li>
        ))}
      </Box>
    </Alert>
  )
}

export default InvalidationNotice
