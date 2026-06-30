package com.danmoop.datanow.Controller;

import com.danmoop.datanow.Annotation.Authenticated;
import com.danmoop.datanow.Annotation.PaymentRequired;
import com.danmoop.datanow.Cache.RedisCache;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    String userId = ((User) request.getAttribute("user")).getId();
    return authService.getUserById(userId);
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
  public ResponseEntity<String> buyPremium(@RequestParam String nonce, @RequestParam String originURL) {
    if (nonce == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nonce is required");
    }

    String cacheKey = "payment:nonce:" + nonce;

    String userId = redisCache.get(cacheKey)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired nonce"));

    redisCache.delete(cacheKey);
    authService.buyPremium(userId);

    String scriptPayload = "<script>window.location.replace(\"" + originURL + "\");</script>";

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.TEXT_HTML);

    return new ResponseEntity<>(scriptPayload, headers, HttpStatus.OK);
  }
}
