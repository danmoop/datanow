import RedisCache from './RedisCache'

const AnalyzeFileCache_TTL = 60 * 60 * 3 // 3 hours

export const AnalyzeFileCache = {
  async get(key: string): Promise<string | null> {
    const value = await RedisCache.get(composeKey(key))
    return value
  },

  async set(key: string, value: string): Promise<void> {
    await RedisCache.set(composeKey(key), value, 'EX', AnalyzeFileCache_TTL)
  }
}

const composeKey = (storageKey: string): string => {
  return `analyze-file:${storageKey}`
}
