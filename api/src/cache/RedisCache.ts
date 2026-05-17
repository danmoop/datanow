import { RedisClient } from 'bun'

class RedisCacheSingleton {
  private static instance: RedisClient
  private constructor() {}

  static getInstance(): RedisClient {
    if (!RedisCacheSingleton.instance) {
      RedisCacheSingleton.instance = new RedisClient(process.env.REDIS_URL)
    }
    return RedisCacheSingleton.instance
  }
}

const RedisCache = RedisCacheSingleton.getInstance()
export default RedisCache
