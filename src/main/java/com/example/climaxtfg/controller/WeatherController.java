package com.example.climaxtfg.controller;

import java.util.List;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.climaxtfg.model.CityTemperature;
import com.example.climaxtfg.model.Forecast;
import com.example.climaxtfg.model.Place;
import com.example.climaxtfg.services.MapService;
import com.example.climaxtfg.services.PlaceService;
import com.example.climaxtfg.services.WeatherService;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
public class WeatherController {

    private static final CacheControl FIVE_MINUTES = CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic();

    private final WeatherService weatherService;
    private final PlaceService placeService;
    private final MapService mapService;

    public WeatherController(WeatherService weatherService, PlaceService placeService, MapService mapService) {
        this.weatherService = weatherService;
        this.placeService = placeService;
        this.mapService = mapService;
    }

    /** GET /api/weather?lat=40.41&lon=-3.70 */
    @GetMapping("/weather")
    public ResponseEntity<Forecast> weather(
            @RequestParam @DecimalMin("-90") @DecimalMax("90") double lat,
            @RequestParam @DecimalMin("-180") @DecimalMax("180") double lon) {
        // Se redondea a ~1 km para que la caché sea efectiva
        Forecast forecast = weatherService.getForecast(round(lat), round(lon));
        return ResponseEntity.ok().cacheControl(FIVE_MINUTES).body(forecast);
    }

    /** GET /api/places?q=valen */
    @GetMapping("/places")
    public List<Place> searchPlaces(@RequestParam @Size(min = 2, max = 80) String q) {
        return placeService.search(q.trim().toLowerCase());
    }

    /** GET /api/places/reverse?lat=..&lon=.. */
    @GetMapping("/places/reverse")
    public Place reverse(
            @RequestParam @DecimalMin("-90") @DecimalMax("90") double lat,
            @RequestParam @DecimalMin("-180") @DecimalMax("180") double lon) {
        return placeService.reverse(round(lat), round(lon));
    }

    /** GET /api/map/cities */
    @GetMapping("/map/cities")
    public ResponseEntity<List<CityTemperature>> mapCities() {
        return ResponseEntity.ok().cacheControl(FIVE_MINUTES).body(mapService.currentTemperatures());
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
