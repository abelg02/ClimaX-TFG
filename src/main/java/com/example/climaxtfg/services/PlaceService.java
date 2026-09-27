package com.example.climaxtfg.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.climaxtfg.client.OpenMeteoClient;
import com.example.climaxtfg.model.Place;
import com.fasterxml.jackson.databind.JsonNode;

@Service
public class PlaceService {

    private final OpenMeteoClient client;

    public PlaceService(OpenMeteoClient client) {
        this.client = client;
    }

    @Cacheable("geocoding")
    public List<Place> search(String query) {
        List<Place> places = new ArrayList<>();
        for (JsonNode r : client.searchPlaces(query).path("results")) {
            places.add(new Place(
                    r.path("name").asText(),
                    textOrNull(r.path("admin1")),
                    textOrNull(r.path("country")),
                    textOrNull(r.path("country_code")),
                    r.path("latitude").asDouble(),
                    r.path("longitude").asDouble()));
        }
        return places;
    }

    /** Nombre del lugar más cercano a unas coordenadas (ubicación del usuario o clic en el mapa). */
    @Cacheable("reverse")
    public Place reverse(double latitude, double longitude) {
        JsonNode result = client.reverse(latitude, longitude);
        JsonNode address = result.path("address");
        String name = firstText(address, "city", "town", "village", "municipality", "county", "state");
        if (name == null) {
            name = "%.2f, %.2f".formatted(latitude, longitude);
        }
        String countryCode = textOrNull(address.path("country_code"));
        return new Place(
                name,
                firstText(address, "state", "province", "region"),
                textOrNull(address.path("country")),
                countryCode != null ? countryCode.toUpperCase() : null,
                latitude,
                longitude);
    }

    private static String firstText(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = textOrNull(node.path(field));
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private static String textOrNull(JsonNode node) {
        return node.isTextual() && !node.asText().isBlank() ? node.asText() : null;
    }
}
