package com.danmoop.datanow.Service;

import com.danmoop.datanow.Cache.RedisCache;
import com.danmoop.datanow.Model.User;
import com.danmoop.datanow.Repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Date;
import java.util.UUID;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
  private final SecretKey jwtKey;
  private final RedisCache redisCache;

  public AuthService(UserRepository userRepository, @Value("${jwt.secret}") String jwtSecret, RedisCache redisCache) {
    this.userRepository = userRepository;
    this.jwtKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    this.redisCache = redisCache;
  }

  public void register(User body) {
    if (body.getEmail() == null || body.getPassword() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
    }

    if (userRepository.findByEmail(body.getEmail()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already exists");
    }

    body.setPassword(passwordEncoder.encode(body.getPassword()));
    body.setCreatedAt(new Date());
    body.setFileUploads(new ArrayList<>());
    userRepository.save(body);
  }

  public String login(User body) {
    if (body.getEmail() == null || body.getPassword() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
    }

    User user = userRepository.findByEmail(body.getEmail())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

    if (!passwordEncoder.matches(body.getPassword(), user.getPassword())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    long now = System.currentTimeMillis();
    return Jwts.builder()
      .claim("id", user.getId())
      .claim("email", user.getEmail())
      .claim("isPremium", user.isPremium())
      .issuedAt(new Date(now))
      .expiration(new Date(now + 3_600_000))
      .signWith(jwtKey)
      .compact();
  }

  public String getNonce(HttpServletRequest request) {
    String nonce = UUID.randomUUID().toString();
    User user = (User) request.getAttribute("user");

    redisCache.set("payment:nonce:" + nonce, user.getId(), Duration.ofMinutes(5));
    return nonce;
  }
}
