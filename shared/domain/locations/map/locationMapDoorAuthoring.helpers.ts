import type { AuthoredDoorLockState, AuthoredDoorOpenState, AuthoredDoorState } from './locationMapDoorAuthoring.types';

export type ResolvedAuthoredDoorState = {
  openState: AuthoredDoorOpenState;
  lockState: AuthoredDoorLockState;
};

/** Defaults missing fields to closed + unlocked. */
export function resolveAuthoredDoorState(state: AuthoredDoorState | undefined): ResolvedAuthoredDoorState {
  return {
    openState: state?.openState ?? 'closed',
    lockState: state?.lockState ?? 'unlocked',
  };
}

/**
 * Canonical authoring shape: **barred implies closed** (invalid `open + barred` from APIs or legacy payloads
 * becomes `closed + barred`). UI may transition through explicit handlers (open while barred → unlocked;
 * barred while open → closed) before persisting.
 */
export function sanitizeAuthoredDoorState(state: AuthoredDoorState | undefined): ResolvedAuthoredDoorState {
  const r = resolveAuthoredDoorState(state);
  let { openState, lockState } = r;
  if (lockState === 'barred') {
    openState = 'closed';
  }
  return { openState, lockState };
}
