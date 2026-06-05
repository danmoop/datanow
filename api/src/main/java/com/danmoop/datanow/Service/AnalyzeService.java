package com.danmoop.datanow.Service;

import com.danmoop.datanow.Cache.AnalyzeFileCache;
import com.danmoop.datanow.Cache.TrendsFileCache;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyzeService {
  private final AnalyzeFileCache analyzeFileCache;
  private final TrendsFileCache trendsFileCache;

  public AnalyzeService(AnalyzeFileCache analyzeFileCache, TrendsFileCache trendsFileCache) {
    this.analyzeFileCache = analyzeFileCache;
    this.trendsFileCache = trendsFileCache;
  }

  public String analyze(String key) {
    return key;
  }

  public String trends(String key) {
    return key;
  }

  private Map<String, Object> callLLM(String systemPrompt, String userContent) {
    return new HashMap<>();
  }
}
