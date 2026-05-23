package com.danmoop.datanow.Controller;

import com.danmoop.datanow.Annotation.Authenticated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analyze")
public class AnalyzeController {

  @Authenticated
  @PostMapping("/summary")
  public String getSummary() {
    return "test";
  }

  @Authenticated
  @PostMapping("/trends")
  public String getTrends() {
    return "test";
  }
}
