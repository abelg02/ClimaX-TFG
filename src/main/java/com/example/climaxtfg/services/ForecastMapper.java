package com.example.climaxtfg.services;

import java.util.ArrayList;
import java.util.List;

import com.example.climaxtfg.model.Forecast;
import com.example.climaxtfg.model.WeatherCodes;
import com.fasterxml.jackson.databind.JsonNode;

/** Convierte el JSON por columnas de Open-Meteo en el modelo de ClimaX. */
final class ForecastMapper {

    static final int HOURS_AHEAD = 24;

    private ForecastMapper() {
    }

    static Forecast toForecast(JsonNode forecast, JsonNode air) {
        JsonNode current = forecast.path("current");
        JsonNode hourly = forecast.path("hourly");

        // Primera hora de la serie que coincide con la hora actual del lugar
        String currentHour = current.path("time").asText().substring(0, 13) + ":00";
        int start = indexOf(hourly.path("time"), currentHour);

        var location = new Forecast.Location(
                forecast.path("latitude").asDouble(),
                forecast.path("longitude").asDouble(),
                forecast.path("elevation").asDouble(),
                forecast.path("timezone").asText(),
                forecast.path("utc_offset_seconds").asInt());

        var now = new Forecast.Current(
                current.path("time").asText(),
                current.path("temperature_2m").asDouble(),
                current.path("apparent_temperature").asDouble(),
                current.path("relative_humidity_2m").asInt(),
                current.path("dew_point_2m").asDouble(),
                current.path("precipitation").asDouble(),
                WeatherCodes.describe(current.path("weather_code").asInt()),
                current.path("is_day").asInt() == 1,
                current.path("cloud_cover").asInt(),
                current.path("pressure_msl").asDouble(),
                current.path("wind_speed_10m").asDouble(),
                current.path("wind_direction_10m").asInt(),
                current.path("wind_gusts_10m").asDouble(),
                hourly.path("uv_index").path(start).asDouble(),
                hourly.path("visibility").path(start).asDouble());

        return new Forecast(location, now, hours(hourly, start), days(forecast.path("daily")), airQuality(air));
    }

    private static List<Forecast.Hour> hours(JsonNode hourly, int start) {
        JsonNode times = hourly.path("time");
        int end = Math.min(times.size(), start + HOURS_AHEAD);
        List<Forecast.Hour> hours = new ArrayList<>(end - start);
        for (int i = start; i < end; i++) {
            hours.add(new Forecast.Hour(
                    times.path(i).asText(),
                    hourly.path("temperature_2m").path(i).asDouble(),
                    hourly.path("precipitation_probability").path(i).asInt(),
                    hourly.path("precipitation").path(i).asDouble(),
                    hourly.path("wind_speed_10m").path(i).asDouble(),
                    WeatherCodes.describe(hourly.path("weather_code").path(i).asInt()),
                    hourly.path("is_day").path(i).asInt() == 1));
        }
        return hours;
    }

    private static List<Forecast.Day> days(JsonNode daily) {
        JsonNode dates = daily.path("time");
        List<Forecast.Day> days = new ArrayList<>(dates.size());
        for (int i = 0; i < dates.size(); i++) {
            days.add(new Forecast.Day(
                    dates.path(i).asText(),
                    WeatherCodes.describe(daily.path("weather_code").path(i).asInt()),
                    daily.path("temperature_2m_max").path(i).asDouble(),
                    daily.path("temperature_2m_min").path(i).asDouble(),
                    daily.path("sunrise").path(i).asText(),
                    daily.path("sunset").path(i).asText(),
                    daily.path("uv_index_max").path(i).asDouble(),
                    daily.path("precipitation_sum").path(i).asDouble(),
                    daily.path("precipitation_probability_max").path(i).asInt(),
                    daily.path("wind_speed_10m_max").path(i).asDouble()));
        }
        return days;
    }

    private static Forecast.AirQuality airQuality(JsonNode air) {
        if (air == null || !air.has("current")) {
            return null;
        }
        JsonNode current = air.path("current");
        return new Forecast.AirQuality(
                intOrNull(current.path("european_aqi")),
                doubleOrNull(current.path("pm10")),
                doubleOrNull(current.path("pm2_5")),
                doubleOrNull(current.path("nitrogen_dioxide")),
                doubleOrNull(current.path("ozone")));
    }

    private static int indexOf(JsonNode times, String value) {
        for (int i = 0; i < times.size(); i++) {
            if (times.path(i).asText().compareTo(value) >= 0) {
                return i;
            }
        }
        return 0;
    }

    private static Integer intOrNull(JsonNode node) {
        return node.isNumber() ? node.asInt() : null;
    }

    private static Double doubleOrNull(JsonNode node) {
        return node.isNumber() ? node.asDouble() : null;
    }
}
