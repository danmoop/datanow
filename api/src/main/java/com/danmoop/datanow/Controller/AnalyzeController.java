package com.danmoop.datanow.Controller;

import com.danmoop.datanow.Annotation.Authenticated;
import com.danmoop.datanow.Service.AnalyzeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/analyze")
public class AnalyzeController {
  private final AnalyzeService analyzeService;

  public AnalyzeController(AnalyzeService analyzeService) {
    this.analyzeService = analyzeService;
  }

  @Authenticated
  @PostMapping("/summary")
  public ResponseEntity<Map<String, String>> getSummary(@RequestParam String key) {
    String result = analyzeService.analyze(key);
    return ResponseEntity.ok(Map.of("result", result));
  }

  @Authenticated
  @PostMapping("/trends")
  public ResponseEntity<Map<String, String>> getTrends(@RequestParam String key) {
    String result = analyzeService.trends(key);
    return ResponseEntity.ok(Map.of("result", result));
  }
}
