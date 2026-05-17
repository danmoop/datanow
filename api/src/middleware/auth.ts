import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import type { AppEnv, AppUser } from '../types'
import { AppError } from '../errors'

export const authMiddleware = async (c: Context<AppEnv>, next: Next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return new AppError(400, 'JWT_SECRET env variable not set up')
    }

    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      return new AppError(400, 'Authorization header missing')
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      return new AppError(400, 'Authorization token missing')
    }

    const decodedPayload = await verify(token, process.env.JWT_SECRET, 'HS256')

    c.set('user', decodedPayload as AppUser)

    return await next()
  } catch (error) {
    return new AppError(401, 'Invalid Token')
  }
}
