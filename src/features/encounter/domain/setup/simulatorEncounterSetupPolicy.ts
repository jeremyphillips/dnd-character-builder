import { DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE } from '@/features/mechanics/domain/environment'

import type { EncounterSetupPolicy } from './encounter-setup-policy.types'

/** Encounter Simulator: empty roster, standard baseline — full manual setup on this DM-only surface. */
export const SIMULATOR_ENCOUNTER_SETUP_POLICY: EncounterSetupPolicy = {
  roster: {
    defaultSelectedAllyIds: [],
    defaultOpponentRoster: [],
  },
  environment: {
    environmentDefaults: DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE,
  },
}
