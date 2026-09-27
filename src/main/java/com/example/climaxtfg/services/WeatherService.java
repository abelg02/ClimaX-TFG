package com.example.climaxtfg.services;

import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.climaxtfg.client.OpenMeteoClient;
import com.example.climaxtfg.exception.ExternalServiceException;
import com.example.climaxtfg.model.Forecast;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class WeatherService {

    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

    private final OpenMeteoClient client;

    public WeatherService(OpenMeteoClient client) {
        this.client = client;
    }

    /**
     * Previsión + calidad del aire, pedidas en paralelo. Si la calidad del aire
     * falla, se devuelve la previsión igualmente (es un dato secundario).
     */
    @Cacheable("forecast")
    public Forecast getForecast(double latitude, double longitude) {
        var air = CompletableFuture.supplyAsync(() -> client.airQuality(latitude, longitude));
        JsonNode forecast = client.forecast(latitude, longitude);

        JsonNode airQuality = null;
        try {
            airQuality = air.join();
        } catch (Exception e) {
            log.warn("Calidad del aire no disponible para {},{}", latitude, longitude);
        }
        if (!forecast.has("current")) {
            throw new ExternalServiceException("La previsión no contiene datos actuales");
        }
        return ForecastMapper.toForecast(forecast, airQuality);
    }
}
