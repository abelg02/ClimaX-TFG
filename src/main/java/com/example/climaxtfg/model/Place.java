package com.example.climaxtfg.model;

public record Place(
        String name,
        String region,
        String country,
        String countryCode,
        double latitude,
        double longitude) {
}
