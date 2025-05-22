// src/main/java/com/example/climaxtfg/dtos/WeatherResponseDTO.java
package com.example.climaxtfg.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WeatherResponseDTO {
    @JsonProperty("location")
    private LocationDTO location;
    @JsonProperty("current")
    private CurrentWeatherDTO current;
    @JsonProperty("forecast")
    private ForecastDTO forecast;

    @Data
    public static class LocationDTO {
        private String name;
        private String region;
        private String country;
        private double lat;
        private double lon;
        private String tz_id;
        private String localtime;
    }

    @Data
    public static class CurrentWeatherDTO {
        private double temp_c;
        private ConditionDTO condition;
        private double feelslike_c;
        private int humidity;
        private double wind_kph;
        private String wind_dir;
        private double pressure_mb;
        private String last_updated;
    }

    @Data
    public static class ConditionDTO {
        private String text;
        private String icon;
    }

    @Data
    public static class ForecastDTO {
        private ForecastDayDTO[] forecastday;
    }

    @Data
    public static class ForecastDayDTO {
        private String date;
        private DayDTO day;
        private HourDTO[] hour;
    }

    @Data
    public static class DayDTO {
        private double maxtemp_c;
        private double mintemp_c;
        private ConditionDTO condition;
    }

    @Data
    public static class HourDTO {
        private String time;
        private double temp_c;
        private ConditionDTO condition;
    }
}