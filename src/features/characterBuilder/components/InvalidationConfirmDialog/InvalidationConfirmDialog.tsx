import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'

import type { InvalidationResult } from '../../validation'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface InvalidationConfirmDialogProps {
  /** The invalidation result to display.  Dialog is open when non-null. */
  invalidations: InvalidationResult | null
  /** Called when the user confirms the change. */
  onConfirm: () => void
  /** Called when the user cancels. */
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const InvalidationConfirmDialog = ({
  invalidations,
  onConfirm,
  onCancel,
}: InvalidationConfirmDialogProps) => {
  const open = invalidations != null && invalidations.hasInvalidations

  // Group affected items by label, deduplicating items that appear in
  // multiple rules targeting the same step (e.g. level→spells + class→spells).
  const groups = new Map<string, string[]>()
  if (invalidations) {
    for (const inv of invalidations.affected) {
      const existing = groups.get(inv.label) ?? []
      groups.set(inv.label, [...existing, ...inv.items])
    }
    // Deduplicate within each group
    for (const [label, items] of groups) {
      groups.set(label, [...new Set(items)])
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3 } },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberRoundedIcon color="warning" />
        This change will affect other steps
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The following selections will be removed because they are no longer
          valid:
        </Typography>

        {[...groups.entries()].map(([label, items]) => (
          <Box key={label} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {label}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                ({items.length})
              </Typography>
            </Typography>

            <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2.5 }}>
              {items.map((item) => (
                <li key={item}>
                  <Typography variant="body2">{item}</Typography>
                </li>
              ))}
            </Box>
          </Box>
        ))}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InvalidationConfirmDialog
