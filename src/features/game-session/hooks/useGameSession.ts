import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import type { GameSession } from '../domain/game-session.types'
import { resolveMockGameSession } from '../data/mock-game-session'

export function useGameSession(): {
  campaignId: string | undefined
  gameSessionId: string | undefined
  session: GameSession | null
} {
  const { id: campaignId, gameSessionId } = useParams<{ id: string; gameSessionId: string }>()
  const { user } = useAuth()

  const session = useMemo(() => {
    if (!campaignId || !gameSessionId || !user?.id) return null
    return resolveMockGameSession(campaignId, gameSessionId, user.id)
  }, [campaignId, gameSessionId, user?.id])

  return { campaignId, gameSessionId, session }
}
