import type { Express } from 'express'
import chatRoutes from './chat.routes'
import authRoutes from './auth.routes'
import characterRoutes from './character.routes'
import userRoutes from './user.routes'
import campaignRoutes from './campaign.routes'

export function registerRoutes(app: Express) {
  app.use('/api/chat', chatRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/characters', characterRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/campaigns', campaignRoutes)
}
