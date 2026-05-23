package com.danmoop.datanow.Configuration;

import com.danmoop.datanow.Interceptor.AuthInterceptor;
import com.danmoop.datanow.Interceptor.PaymentInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final AuthInterceptor authInterceptor;
  private final PaymentInterceptor paymentInterceptor;

  public WebConfig(AuthInterceptor authInterceptor, PaymentInterceptor paymentInterceptor) {
    this.authInterceptor = authInterceptor;
    this.paymentInterceptor = paymentInterceptor;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(authInterceptor);
    registry.addInterceptor(paymentInterceptor);
  }
}
