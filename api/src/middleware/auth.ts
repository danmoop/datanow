import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import type { AppEnv, AppUser } from '../types'
import { AppError } from '../errors'

export const authMiddleware = async (
  c: Context<AppEnv>,
  next: Next
): Promise<void> => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new AppError(400, 'JWT_SECRET env variable not set up')
    }

    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
      throw new AppError(400, 'Authorization header missing')
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      throw new AppError(400, 'Authorization token missing')
    }

    const decodedPayload = await verify(token, process.env.JWT_SECRET, 'HS256')

    c.set('user', decodedPayload as AppUser)

    return await next()
  } catch (error) {
    throw new AppError(401, 'Invalid Token')
  }
}
