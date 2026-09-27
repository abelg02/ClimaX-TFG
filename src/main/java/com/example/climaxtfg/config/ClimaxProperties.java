package com.example.climaxtfg.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "climax")
public record ClimaxProperties(OpenMeteo openMeteo, Nominatim nominatim, Cors cors) {

    public record OpenMeteo(String forecastUrl, String airQualityUrl, String geocodingUrl) {
    }

    public record Nominatim(String reverseUrl) {
    }

    public record Cors(List<String> allowedOrigins) {
    }
}
