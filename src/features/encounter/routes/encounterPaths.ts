/**
 * Campaign-scoped URLs for the **Encounter Simulator** (dev/testing combat surface).
 * Path segment stays `encounter` for stability; see `docs/reference/combat/architecture.md`.
 *
 * Player-facing live play will be a separate **GameSession** feature, not this route tree.
 */
export function campaignEncounterPath(campaignId: string): string {
  return `/campaigns/${campaignId}/encounter`
}

export function campaignEncounterSetupPath(campaignId: string): string {
  return `/campaigns/${campaignId}/encounter/setup`
}

export function campaignEncounterActivePath(campaignId: string): string {
  return `/campaigns/${campaignId}/encounter/active`
}
