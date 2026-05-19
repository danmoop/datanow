import { RedisClient } from 'bun'
import { AppError } from '../errors'

class RedisCacheSingleton {
  private static instance: RedisClient
  private constructor() {}

  static getInstance(): RedisClient {
    if (!RedisCacheSingleton.instance) {
      if (!process.env.REDIS_URL) {
        throw new AppError(400, 'REDIS_URL is not set')
      }

      RedisCacheSingleton.instance = new RedisClient(process.env.REDIS_URL)
    }
    return RedisCacheSingleton.instance
  }
}

const RedisCache = RedisCacheSingleton.getInstance()
export default RedisCache
