/**
 * Route shell for the **Encounter Simulator**: local combat setup + active combat under one provider.
 * Not the future player-facing **GameSession** container (that will be a separate feature).
 */
import { Outlet } from 'react-router-dom'

import { EncounterRuntimeProvider } from './EncounterRuntimeContext'

export default function EncounterLayout() {
  return (
    <EncounterRuntimeProvider>
      <Outlet />
    </EncounterRuntimeProvider>
  )
}
