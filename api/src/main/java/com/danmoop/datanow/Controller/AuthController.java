package com.danmoop.datanow.Controller;

import com.danmoop.datanow.Annotation.Authenticated;
import com.danmoop.datanow.Interceptor.AuthInterceptor;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Service.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @Authenticated
  @GetMapping("/me")
  public User getUser(HttpServletRequest request) {
    Claims claims = (Claims) request.getAttribute(AuthInterceptor.CLAIMS_ATTR);
    return authService.getUser(claims);
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
  public ResponseEntity<Map<String, String>> getNonce() {
    return ResponseEntity.ok(Map.of("nonce", UUID.randomUUID().toString()));
  }

  @GetMapping("/buyPremium")
  public String buyPremium() {
    return "OK";
  }
}
