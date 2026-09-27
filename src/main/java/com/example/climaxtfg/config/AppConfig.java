package com.example.climaxtfg.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    /** Cliente HTTP compartido para las APIs externas, con timeouts para no bloquear peticiones. */
    @Bean
    public RestClient restClient(RestClient.Builder builder) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(4));
        requestFactory.setReadTimeout(Duration.ofSeconds(8));
        return builder
                .requestFactory(requestFactory)
                // Nominatim exige identificar la aplicación
                .defaultHeader(HttpHeaders.USER_AGENT, "ClimaX/2.0 (github.com/abelg02/ClimaX-TFG)")
                .build();
    }
}
