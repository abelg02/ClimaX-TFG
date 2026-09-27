package com.example.climaxtfg.model;

/** Temperatura actual de una ciudad destacada, para pintarla en el mapa. */
public record CityTemperature(
        String name,
        double latitude,
        double longitude,
        double temperature,
        double windSpeed,
        Condition condition,
        boolean isDay) {
}
