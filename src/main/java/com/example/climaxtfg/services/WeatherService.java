// src/main/java/com/example/climaxtfg/services/WeatherService.java
package com.example.climaxtfg.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class WeatherService {

    @Value("${weatherapi.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public WeatherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getWeatherForCity(String city) {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://api.weatherapi.com/v1/forecast.json")
                .queryParam("key", apiKey)
                .queryParam("q", city)
                .queryParam("days", 7)
                .queryParam("lang", "es")
                .queryParam("aqi", "no")
                .queryParam("alerts", "no")
                .toUriString();

        return restTemplate.getForObject(url, String.class);
    }
}
