package com.danmoop.datanow.Cache;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class RedisCache {

  private final StringRedisTemplate redis;

  public RedisCache(StringRedisTemplate redis) {
    this.redis = redis;
  }

  public void set(String key, String value, Duration ttl) {
    redis.opsForValue().set(key, value, ttl);
  }

  public Optional<String> get(String key) {
    return Optional.ofNullable(redis.opsForValue().get(key));
  }

  public long incr(String key, int value) {
    return redis.opsForValue().increment(key, value);
  }

  public void delete(String key) {
    redis.delete(key);
  }

  public void expire(String key, long timeout) {
    redis.expire(key, timeout, TimeUnit.SECONDS);
  }
}
