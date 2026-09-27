package com.example.climaxtfg.model;

import java.util.List;

/**
 * Previsión completa para unas coordenadas. Las horas se devuelven en la hora
 * local del lugar (ISO-8601 sin zona), tal y como las entrega Open-Meteo.
 */
public record Forecast(
        Location location,
        Current current,
        List<Hour> hourly,
        List<Day> daily,
        AirQuality airQuality) {

    public record Location(double latitude, double longitude, double elevation,
                           String timezone, int utcOffsetSeconds) {
    }

    public record Current(
            String time,
            double temperature,
            double apparentTemperature,
            int humidity,
            double dewPoint,
            double precipitation,
            Condition condition,
            boolean isDay,
            int cloudCover,
            double pressure,
            double windSpeed,
            int windDirection,
            double windGusts,
            double uvIndex,
            double visibility) {
    }

    public record Hour(
            String time,
            double temperature,
            int precipitationProbability,
            double precipitation,
            double windSpeed,
            Condition condition,
            boolean isDay) {
    }

    public record Day(
            String date,
            Condition condition,
            double temperatureMax,
            double temperatureMin,
            String sunrise,
            String sunset,
            double uvIndexMax,
            double precipitationSum,
            int precipitationProbability,
            double windSpeedMax) {
    }

    public record AirQuality(
            Integer europeanAqi,
            Double pm10,
            Double pm25,
            Double nitrogenDioxide,
            Double ozone) {
    }
}
