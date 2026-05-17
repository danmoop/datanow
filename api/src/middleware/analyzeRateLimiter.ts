import type { Context } from 'hono'
import { ObjectId } from 'mongodb'
import type { AppEnv } from '../types'
import RedisCache from '../cache/RedisCache'
import { AppError } from '../errors'
import { UserModel } from '../model/user'

const FREE_TIER_LIMIT = 3
const WINDOW_SECONDS = 3600

/**
 *
 * Rate limiter middleware for analyze routes.
 * Limits free users to 3 analyze requests per hour.
 * Premium users have unlimited access.
 */
export const analyzeRateLimiter = async (c: Context<AppEnv>) => {
  const { id } = c.var.user
  const userDB = await UserModel.findOne({ _id: new ObjectId(id) }).lean()

  if (!userDB) {
    throw new AppError(404, 'User not found')
  }

  if (userDB.isPremium) {
    return
  }

  const key = `ratelimit:analyze:${id}`
  const count = await RedisCache.incr(key)

  if (count === 1) {
    await RedisCache.expire(key, WINDOW_SECONDS)
  }

  if (count > FREE_TIER_LIMIT) {
    throw new AppError(
      429,
      'Rate limit exceeded. Upgrade to premium for unlimited access.'
    )
  }
}
