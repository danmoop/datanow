package com.danmoop.datanow.Controller;

import com.danmoop.datanow.Annotation.Authenticated;
import com.danmoop.datanow.Annotation.PaymentRequired;
import com.danmoop.datanow.Cache.RedisCache;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;
  private final RedisCache redisCache;

  public AuthController(AuthService authService, RedisCache redisCache) {
    this.authService = authService;
    this.redisCache = redisCache;
  }

  @Authenticated
  @GetMapping("/me")
  public User getUser(HttpServletRequest request) {
    return (User) request.getAttribute("user");
  }

  @PostMapping("/register")
  public ResponseEntity<Map<String, String>> registerUser(@RequestBody User body) {
    authService.register(body);
    return ResponseEntity.ok(Map.of("message", "User registered successfully"));
  }

  @PostMapping("/login")
  public ResponseEntity<Map<String, String>> login(@RequestBody User body) {
    String token = authService.login(body);
    return ResponseEntity.ok(Map.of("token", token));
  }

  @Authenticated
  @PostMapping("/nonce")
  public ResponseEntity<Map<String, String>> getNonce(HttpServletRequest request) {
    return ResponseEntity.ok(Map.of("nonce", authService.getNonce(request)));
  }

  @PaymentRequired
  @GetMapping("/buyPremium")
  public String buyPremium() {
    return "OK";
  }
}
