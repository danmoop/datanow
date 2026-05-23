package com.danmoop.datanow.Interceptor;

import com.danmoop.datanow.Annotation.PaymentRequired;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class PaymentInterceptor implements HandlerInterceptor {

  private final String paymentKey;

  public PaymentInterceptor(@Value("${paymentKey}") String paymentKey) {
    this.paymentKey = paymentKey;
  }

  @Override
  public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws IOException {
    if (!(handler instanceof HandlerMethod method)) {
      return true;
    }

    if (method.hasMethodAnnotation(PaymentRequired.class)) {
      String signature = request.getHeader("x-pay-signature");
      if (signature == null || !signature.equals(paymentKey)) {
        response.sendError(HttpServletResponse.SC_PAYMENT_REQUIRED, "Invalid payment signature");
        return false;
      }
    }

    return true;
  }
}
