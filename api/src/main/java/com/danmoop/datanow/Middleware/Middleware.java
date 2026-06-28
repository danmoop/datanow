package com.danmoop.datanow.Middleware;

import java.util.Date;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.danmoop.datanow.Cache.RedisCache;
import com.danmoop.datanow.Model.User;

@Service
public class Middleware {
  private final RedisCache redisCache;
  private final long GENERAL_CACHE_TTL = 3600;
  private final int FREE_TIER_LIMIT = 3;

  public Middleware(RedisCache redisCache) {
    this.redisCache = redisCache;
  }

  public void analyzeRateLimiter(User user) {
    if (user.isPremium()) {
      return;
    }
    
    String cacheKey = "ratelimit:analyze:" + user.getId();
    
    long count = redisCache.incr(cacheKey, 1);
    
    if (count == 1) {
      redisCache.expire(cacheKey, GENERAL_CACHE_TTL);
    }

    if (count > FREE_TIER_LIMIT) {
      long now = new Date().getTime();
      long remainingSeconds = Math.round(
      GENERAL_CACHE_TTL - ((now / 1000) % GENERAL_CACHE_TTL));

      throw new ResponseStatusException(
        HttpStatus.TOO_MANY_REQUESTS, 
        "Rate limit exceeded. Upgrade to premium for unlimited access or try again in " + remainingSeconds + " seconds."
      );
    }
  }
}
