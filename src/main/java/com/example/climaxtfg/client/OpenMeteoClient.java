package com.example.climaxtfg.client;

import java.net.URI;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.climaxtfg.config.ClimaxProperties;
import com.example.climaxtfg.exception.ExternalServiceException;
import com.fasterxml.jackson.databind.JsonNode;

/** Acceso de bajo nivel a Open-Meteo y Nominatim. Devuelve el JSON tal cual. */
@Component
public class OpenMeteoClient {

    static final String CURRENT = String.join(",",
            "temperature_2m", "relative_humidity_2m", "apparent_temperature", "dew_point_2m",
            "is_day", "precipitation", "weather_code", "cloud_cover", "pressure_msl",
            "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m");
    static final String HOURLY = String.join(",",
            "temperature_2m", "precipitation_probability", "precipitation", "weather_code",
            "is_day", "wind_speed_10m", "uv_index", "visibility");
    static final String DAILY = String.join(",",
            "weather_code", "temperature_2m_max", "temperature_2m_min", "sunrise", "sunset",
            "uv_index_max", "precipitation_sum", "precipitation_probability_max", "wind_speed_10m_max");

    private final RestClient http;
    private final ClimaxProperties properties;

    public OpenMeteoClient(RestClient http, ClimaxProperties properties) {
        this.http = http;
        this.properties = properties;
    }

    public JsonNode forecast(double latitude, double longitude) {
        URI uri = UriComponentsBuilder.fromUriString(properties.openMeteo().forecastUrl())
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("current", CURRENT)
                .queryParam("hourly", HOURLY)
                .queryParam("daily", DAILY)
                .queryParam("timezone", "auto")
                .queryParam("forecast_days", 7)
                .build().toUri();
        return get(uri, "previsión");
    }

    public JsonNode airQuality(double latitude, double longitude) {
        URI uri = UriComponentsBuilder.fromUriString(properties.openMeteo().airQualityUrl())
                .queryParam("latitude", latitude)
                .queryParam("longitude", longitude)
                .queryParam("current", "european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone")
                .queryParam("timezone", "auto")
                .build().toUri();
        return get(uri, "calidad del aire");
    }

    /** Una sola petición para varias ubicaciones; Open-Meteo devuelve un array. */
    public JsonNode currentForMany(List<double[]> coordinates) {
        URI uri = UriComponentsBuilder.fromUriString(properties.openMeteo().forecastUrl())
                .queryParam("latitude", join(coordinates, c -> c[0]))
                .queryParam("longitude", join(coordinates, c -> c[1]))
                .queryParam("current", "temperature_2m,weather_code,is_day,wind_speed_10m")
                .queryParam("timezone", "auto")
                .build().toUri();
        return get(uri, "temperaturas del mapa");
    }

    public JsonNode searchPlaces(String query) {
        URI uri = UriComponentsBuilder.fromUriString(properties.openMeteo().geocodingUrl())
                .queryParam("name", query)
                .queryParam("count", 8)
                .queryParam("language", "es")
                .queryParam("format", "json")
                .encode()
                .build().toUri();
        return get(uri, "búsqueda de lugares");
    }

    public JsonNode reverse(double latitude, double longitude) {
        URI uri = UriComponentsBuilder.fromUriString(properties.nominatim().reverseUrl())
                .queryParam("lat", latitude)
                .queryParam("lon", longitude)
                .queryParam("format", "jsonv2")
                .queryParam("zoom", 10)
                .queryParam("accept-language", "es")
                .build().toUri();
        return get(uri, "geocodificación inversa");
    }

    private JsonNode get(URI uri, String what) {
        try {
            JsonNode body = http.get().uri(uri).retrieve().body(JsonNode.class);
            if (body == null) {
                throw new ExternalServiceException("Respuesta vacía del servicio de " + what);
            }
            return body;
        } catch (RestClientException e) {
            throw new ExternalServiceException("No se pudo consultar el servicio de " + what, e);
        }
    }

    private static String join(List<double[]> coordinates, Function<double[], Double> pick) {
        return coordinates.stream().map(pick).map(String::valueOf).collect(Collectors.joining(","));
    }
}
