/** Authoring-only door open/closed (instance state, not variants). */
export type AuthoredDoorOpenState = 'closed' | 'open';

/** Authoring-only lock/bar — does not yet drive encounter mechanics beyond persistence/UI. */
export type AuthoredDoorLockState = 'unlocked' | 'locked' | 'barred';

export type AuthoredDoorState = {
  openState?: AuthoredDoorOpenState;
  lockState?: AuthoredDoorLockState;
};
