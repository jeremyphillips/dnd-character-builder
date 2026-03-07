import type { Express } from 'express'
import characterRoutes from './features/character/routes/character.routes'
import authRoutes from './features/auth/routes/auth.routes'
import { registerRoutes } from './routes'

/**
 * Single entry point for route registration.
 * Character and auth features migrated; others still from routes/.
 */
export function registerAppRoutes(app: Express) {
  app.use('/api/characters', characterRoutes)
  app.use('/api/auth', authRoutes)
  registerRoutes(app)
}
