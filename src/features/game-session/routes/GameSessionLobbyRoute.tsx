import { useGameSession } from '../hooks/useGameSession'
import { GameSessionLobbyView } from '../components/GameSessionLobbyView'

export default function GameSessionLobbyRoute() {
  const { session } = useGameSession()
  if (!session) return null
  return <GameSessionLobbyView session={session} />
}
