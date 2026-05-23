package com.danmoop.datanow.Interceptor;

import com.danmoop.datanow.Annotation.Authenticated;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class AuthInterceptor implements HandlerInterceptor {

  public static final String CLAIMS_ATTR = "jwtClaims";

  private final SecretKey jwtKey;

  public AuthInterceptor(@Value("${jwt.secret}") String jwtSecret) {
    this.jwtKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
  }

  @Override
  public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler)
    throws Exception {
    if (!(handler instanceof HandlerMethod method)) {
      return true;
    }

    // If a method has an @Authenticated annotation requiring Auth
    if (method.hasMethodAnnotation(Authenticated.class)) {
      String authHeader = request.getHeader("Authorization");
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        try {
          String token = authHeader.substring(7);
          Claims claims = Jwts.parser().verifyWith(jwtKey).build().parseSignedClaims(token).getPayload();
          request.setAttribute(CLAIMS_ATTR, claims);
        } catch (Exception ignored) {
        }
      }
      if (request.getAttribute(CLAIMS_ATTR) == null) {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
        return false;
      }
    }

    return true;
  }
}
