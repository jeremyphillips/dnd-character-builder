import { env } from './config/env'
import { connectDB } from './config/mongo'
import app from './app'

async function bootstrap() {
  await connectDB()

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`)
  })
}

bootstrap()
