import type { AuthoredDoorLockState, AuthoredDoorOpenState } from '@/shared/domain/locations';
import { sanitizeAuthoredDoorState, type ResolvedAuthoredDoorState } from '@/shared/domain/locations';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const OPEN_OPTIONS: AuthoredDoorOpenState[] = ['closed', 'open'];
const LOCK_OPTIONS: AuthoredDoorLockState[] = ['unlocked', 'locked', 'barred'];

export type DoorStateFieldsProps = {
  doorState: ResolvedAuthoredDoorState;
  /** Emits sanitized authoring state (invalid combos coerced). */
  onChange: (next: ResolvedAuthoredDoorState) => void;
  /** Edge-run: door state applies to the anchor segment only. */
  anchorScopeCaption?: boolean;
};

export function DoorStateFields({ doorState, onChange, anchorScopeCaption }: DoorStateFieldsProps) {
  const handleOpenChange = (nextOpen: AuthoredDoorOpenState) => {
    let lockState = doorState.lockState;
    if (nextOpen === 'open' && lockState === 'barred') {
      lockState = 'unlocked';
    }
    onChange(sanitizeAuthoredDoorState({ ...doorState, openState: nextOpen, lockState }));
  };

  const handleLockChange = (nextLock: AuthoredDoorLockState) => {
    let openState = doorState.openState;
    if (nextLock === 'barred' && openState === 'open') {
      openState = 'closed';
    }
    onChange(sanitizeAuthoredDoorState({ ...doorState, openState, lockState: nextLock }));
  };

  const openDisabled = doorState.lockState === 'barred';
  const barredDisabled = doorState.openState === 'open';

  return (
    <Stack spacing={1.5}>
      {anchorScopeCaption ? (
        <Typography variant="caption" color="text.secondary">
          Door state applies to this segment only (anchor), not the whole run.
        </Typography>
      ) : null}
      <FormControl size="small" fullWidth>
        <InputLabel id="door-open-state-label">Open state</InputLabel>
        <Select
          labelId="door-open-state-label"
          label="Open state"
          value={doorState.openState}
          onChange={(e) => handleOpenChange(e.target.value as AuthoredDoorOpenState)}
        >
          {OPEN_OPTIONS.map((v) => (
            <MenuItem key={v} value={v} disabled={v === 'open' && openDisabled}>
              {v === 'closed' ? 'Closed' : 'Open'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" fullWidth>
        <InputLabel id="door-lock-state-label">Lock state</InputLabel>
        <Select
          labelId="door-lock-state-label"
          label="Lock state"
          value={doorState.lockState}
          onChange={(e) => handleLockChange(e.target.value as AuthoredDoorLockState)}
        >
          {LOCK_OPTIONS.map((v) => (
            <MenuItem key={v} value={v} disabled={v === 'barred' && barredDisabled}>
              {v === 'unlocked' ? 'Unlocked' : v === 'locked' ? 'Locked' : 'Barred'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
