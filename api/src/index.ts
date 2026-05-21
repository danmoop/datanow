import mongoose from 'mongoose'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { AppError } from './errors'

import AuthRouter from './routes/auth'
import FileRouter from './routes/files'
import AnalyzeRouter from './routes/analyze'

const app = new Hono()

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI env variable not set up')
  process.exit(0)
}

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ message: err.message }, err.status as 400 | 401 | 403 | 404)
  }
  console.error(err)
  return c.json({ message: 'Internal server error' }, 500)
})

// CORS middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization']
  })
)

await mongoose.connect(`${process.env.MONGO_URI}?replicaSet=rs0`)

app.get('/', async (c) => {
  return c.json({ message: 'Welcome to the DataNow API' })
})

app.route('/auth', AuthRouter)
app.route('/files', FileRouter)
app.route('/analyze', AnalyzeRouter)

export default {
  fetch: app.fetch,
  port: 3000,
  idleTimeout: 255
}
