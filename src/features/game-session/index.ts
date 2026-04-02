export type {
  GameSession,
  GameSessionLocationContext,
  GameSessionParticipant,
  GameSessionParticipantRole,
  GameSessionStatus,
} from './domain/game-session.types'
export { DEMO_GAME_SESSION_ID, resolveMockGameSession } from './data/mock-game-session'
export { useGameSession } from './hooks/useGameSession'
export {
  campaignGameSessionLobbyPath,
  campaignGameSessionPath,
  campaignGameSessionSetupPath,
  campaignGameSessionsListPath,
} from './routes/gameSessionPaths'
