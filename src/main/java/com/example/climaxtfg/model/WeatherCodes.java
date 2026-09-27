package com.example.climaxtfg.model;

import java.util.Map;

/**
 * Traducción de los códigos WMO de Open-Meteo.
 * https://open-meteo.com/en/docs#weather_variable_documentation
 */
public final class WeatherCodes {

    private static final Map<Integer, Condition> CONDITIONS = Map.ofEntries(
            entry(0, "Despejado", "clear"),
            entry(1, "Mayormente despejado", "clear"),
            entry(2, "Parcialmente nublado", "partly"),
            entry(3, "Cubierto", "cloudy"),
            entry(45, "Niebla", "fog"),
            entry(48, "Niebla con escarcha", "fog"),
            entry(51, "Llovizna débil", "drizzle"),
            entry(53, "Llovizna", "drizzle"),
            entry(55, "Llovizna intensa", "drizzle"),
            entry(56, "Llovizna helada", "drizzle"),
            entry(57, "Llovizna helada intensa", "drizzle"),
            entry(61, "Lluvia débil", "rain"),
            entry(63, "Lluvia", "rain"),
            entry(65, "Lluvia intensa", "rain"),
            entry(66, "Lluvia helada", "rain"),
            entry(67, "Lluvia helada intensa", "rain"),
            entry(71, "Nevada débil", "snow"),
            entry(73, "Nevada", "snow"),
            entry(75, "Nevada intensa", "snow"),
            entry(77, "Granizo fino", "snow"),
            entry(80, "Chubascos débiles", "rain"),
            entry(81, "Chubascos", "rain"),
            entry(82, "Chubascos violentos", "rain"),
            entry(85, "Chubascos de nieve", "snow"),
            entry(86, "Chubascos de nieve intensos", "snow"),
            entry(95, "Tormenta", "storm"),
            entry(96, "Tormenta con granizo", "storm"),
            entry(99, "Tormenta con granizo intenso", "storm"));

    private WeatherCodes() {
    }

    public static Condition describe(int code) {
        return CONDITIONS.getOrDefault(code, new Condition(code, "Desconocido", "cloudy"));
    }

    private static Map.Entry<Integer, Condition> entry(int code, String description, String group) {
        return Map.entry(code, new Condition(code, description, group));
    }
}
