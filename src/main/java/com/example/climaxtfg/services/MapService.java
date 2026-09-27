package com.example.climaxtfg.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.climaxtfg.client.OpenMeteoClient;
import com.example.climaxtfg.model.CityTemperature;
import com.example.climaxtfg.model.WeatherCodes;
import com.fasterxml.jackson.databind.JsonNode;

/** Temperaturas actuales de las ciudades que se muestran en el mapa. */
@Service
public class MapService {

    record City(String name, double latitude, double longitude) {
    }

    static final List<City> CITIES = List.of(
            // España peninsular
            new City("Madrid", 40.4168, -3.7038),
            new City("Barcelona", 41.3874, 2.1686),
            new City("Valencia", 39.4699, -0.3763),
            new City("Sevilla", 37.3891, -5.9845),
            new City("Zaragoza", 41.6488, -0.8891),
            new City("Málaga", 36.7213, -4.4214),
            new City("Murcia", 37.9922, -1.1307),
            new City("Bilbao", 43.2630, -2.9350),
            new City("Valladolid", 41.6523, -4.7245),
            new City("Vigo", 42.2406, -8.7207),
            new City("A Coruña", 43.3623, -8.4115),
            new City("Oviedo", 43.3614, -5.8494),
            new City("Santander", 43.4623, -3.8099),
            new City("San Sebastián", 43.3183, -1.9812),
            new City("Pamplona", 42.8125, -1.6458),
            new City("Logroño", 42.4627, -2.4450),
            new City("Burgos", 42.3439, -3.6969),
            new City("León", 42.5987, -5.5671),
            new City("Salamanca", 40.9701, -5.6635),
            new City("Cáceres", 39.4753, -6.3724),
            new City("Badajoz", 38.8794, -6.9707),
            new City("Toledo", 39.8628, -4.0273),
            new City("Albacete", 38.9943, -1.8585),
            new City("Alicante", 38.3452, -0.4810),
            new City("Castellón", 39.9864, -0.0513),
            new City("Tarragona", 41.1189, 1.2445),
            new City("Lleida", 41.6176, 0.6200),
            new City("Girona", 41.9794, 2.8214),
            new City("Huesca", 42.1401, -0.4089),
            new City("Teruel", 40.3456, -1.1065),
            new City("Cuenca", 40.0704, -2.1374),
            new City("Soria", 41.7666, -2.4790),
            new City("Granada", 37.1773, -3.5986),
            new City("Córdoba", 37.8882, -4.7794),
            new City("Almería", 36.8340, -2.4637),
            new City("Jaén", 37.7796, -3.7849),
            new City("Huelva", 37.2614, -6.9447),
            new City("Cádiz", 36.5271, -6.2886),
            // Islas
            new City("Palma", 39.5696, 2.6502),
            new City("Ibiza", 38.9067, 1.4206),
            new City("Las Palmas", 28.1235, -15.4363),
            new City("Santa Cruz de Tenerife", 28.4636, -16.2518),
            // Europa
            new City("Lisboa", 38.7223, -9.1393),
            new City("Oporto", 41.1579, -8.6291),
            new City("París", 48.8566, 2.3522),
            new City("Burdeos", 44.8378, -0.5792),
            new City("Marsella", 43.2965, 5.3698),
            new City("Londres", 51.5072, -0.1276),
            new City("Roma", 41.9028, 12.4964),
            new City("Berlín", 52.5200, 13.4050),
            new City("Ámsterdam", 52.3676, 4.9041),
            new City("Rabat", 34.0209, -6.8416));

    private final OpenMeteoClient client;

    public MapService(OpenMeteoClient client) {
        this.client = client;
    }

    @Cacheable("mapCities")
    public List<CityTemperature> currentTemperatures() {
        List<double[]> coordinates = CITIES.stream()
                .map(c -> new double[] {c.latitude(), c.longitude()})
                .toList();
        JsonNode response = client.currentForMany(coordinates);

        List<CityTemperature> result = new ArrayList<>(CITIES.size());
        for (int i = 0; i < CITIES.size() && i < response.size(); i++) {
            City city = CITIES.get(i);
            JsonNode current = response.path(i).path("current");
            result.add(new CityTemperature(
                    city.name(),
                    city.latitude(),
                    city.longitude(),
                    current.path("temperature_2m").asDouble(),
                    current.path("wind_speed_10m").asDouble(),
                    WeatherCodes.describe(current.path("weather_code").asInt()),
                    current.path("is_day").asInt() == 1));
        }
        return result;
    }
}
