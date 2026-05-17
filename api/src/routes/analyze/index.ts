import { Hono } from 'hono'
import type { AppEnv } from '../../types'
import { authMiddleware } from '../../middleware/auth'
import { AnalyzeModule } from './module'
import { AppError } from '../../errors'

const app = new Hono<AppEnv>()

app.post('/summary', authMiddleware, async (c) => {
  const key = c.req.query('key')
  if (!key) {
    throw new AppError(400, 'Storage key is required')
  }

  const result = await AnalyzeModule.analyze(c, key)
  if (!result.message?.content) {
    throw new AppError(502, `LLM error: ${JSON.stringify(result)}`)
  }

  return c.json({ result: result.message.content })
})

app.post('/trends', authMiddleware, async (c) => {
  const key = c.req.query('key')
  if (!key) {
    throw new AppError(400, 'Storage key is required')
  }

  const result = await AnalyzeModule.trends(c, key)
  if (!result.message?.content) {
    throw new AppError(502, `LLM error: ${JSON.stringify(result)}`)
  }

  return c.json({ result: result.message.content })
})

export default app
