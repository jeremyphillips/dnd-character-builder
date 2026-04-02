import { useGameSession } from '../hooks/useGameSession'
import { GameSessionSetupView } from '../components/GameSessionSetupView'

export default function GameSessionSetupRoute() {
  const { session } = useGameSession()
  if (!session) return null
  return <GameSessionSetupView session={session} />
}
