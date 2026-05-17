import RedisCache from './RedisCache'

const TrendsFileCache_TTL = 60 * 60 * 3 // 3 hours

export const TrendsFileCache = {
  async get(key: string): Promise<string | null> {
    const value = await RedisCache.get(composeKey(key))
    return value
  },

  async set(key: string, value: string): Promise<void> {
    await RedisCache.set(composeKey(key), value, 'EX', TrendsFileCache_TTL)
  }
}

const composeKey = (storageKey: string): string => {
  return `trends-file:${storageKey}`
}
