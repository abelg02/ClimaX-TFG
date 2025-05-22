// src/main/java/com/example/climaxtfg/controllers/WeatherController.java
package com.example.climaxtfg.controllers;

import com.example.climaxtfg.services.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    @Autowired
    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/forecast")
    public ResponseEntity<String> getWeatherForecast(@RequestParam String city) {
        return weatherService.getWeatherForecast(city);
    }
}