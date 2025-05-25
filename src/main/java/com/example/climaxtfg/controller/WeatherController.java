// src/main/java/com/example/climaxtfg/controllers/WeatherController.java
package com.example.climaxtfg.controller;

import com.example.climaxtfg.services.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*") // Asegúrate de configurar correctamente para producción
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @GetMapping("/{city}")
    public String getWeather(@PathVariable String city) {
        return weatherService.getWeatherForCity(city);
    }
}
