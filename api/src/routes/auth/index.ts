import { Hono } from 'hono'
import { randomUUIDv7 } from 'bun'
import { authMiddleware } from '../../middleware/auth'
import { type AppEnv } from '../../types'
import { AuthModule } from './module'
import { UserModel } from '../../model/user'
import { AppError } from '../../errors'
import { paymentMiddleware } from '../../middleware/payment'
import RedisCache from '../../cache/RedisCache'

const app = new Hono<AppEnv>()

app.get('/me', authMiddleware, async (c) => {
  const { id } = c.var.user
  const user = await UserModel.findById(id).select('-password -__v').lean()
  if (!user) {
    throw new AppError(404, 'User not found')
  }
  return c.json(user)
})

app.post('/register', async (c) => {
  await AuthModule.registerUser(c)
  return c.json({ message: 'User registered successfully' })
})

app.post('/login', async (c) => {
  const token = await AuthModule.loginUser(c)
  return c.json({ token })
})

app.post('/nonce', authMiddleware, async (c) => {
  const { id } = c.var.user
  const nonce = randomUUIDv7()
  await RedisCache.set(`payment:nonce:${nonce}`, id as string, 'EX', 300)
  return c.json({ nonce })
})

app.get('/buyPremium', paymentMiddleware, async (c) => {
  const nonce = c.req.query('nonce')
  const originURL = c.req.query('originURL')
  if (!nonce) {
    throw new AppError(400, 'Nonce is required')
  }

  const userId = await RedisCache.get(`payment:nonce:${nonce}`)
  if (!userId) {
    throw new AppError(401, 'Invalid or expired nonce')
  }

  await RedisCache.del(`payment:nonce:${nonce}`)
  await AuthModule.buyPremium(userId)

  return c.html(`<script>window.location.replace("${originURL}")</script>`)
})

export default app
