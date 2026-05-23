package com.danmoop.datanow.Cache;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
public class AnalyzeFileCache {

  private final Duration TTL = Duration.ofHours(1);
  private final RedisCache redis;

  public AnalyzeFileCache(RedisCache redis) {
    this.redis = redis;
  }

  public void set(String storageKey, String value) {
    redis.set(composeKey(storageKey), value, TTL);
  }

  public Optional<String> get(String storageKey) {
    return redis.get(composeKey(storageKey));
  }

  public void delete(String storageKey) {
    redis.delete(composeKey(storageKey));
  }

  private String composeKey(String storageKey) {
    return "analyze-file:" + storageKey;
  }
}
