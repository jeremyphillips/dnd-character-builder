import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { corsOptions } from './config/cors'
import { requestLogger } from './middleware/requestLogger'
import { errorHandler } from './middleware/errorHandler'
import { registerRoutes } from './routes'

const app = express()

// Trust proxy (needed when behind Vite dev proxy)
app.set('trust proxy', true)

// CORS
app.use(cors(corsOptions))
app.options('/*', (_req, res) => res.sendStatus(200))

// Cookie parsing
app.use(cookieParser())

// Body parsing
app.use(express.json())

// Logging
app.use(requestLogger)

// API routes
registerRoutes(app)

// Error handling (must be last)
app.use(errorHandler)

export default app
