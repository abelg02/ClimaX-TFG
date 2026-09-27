package com.example.climaxtfg;

import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.climaxtfg.exception.ExternalServiceException;
import com.example.climaxtfg.model.Place;
import com.example.climaxtfg.services.MapService;
import com.example.climaxtfg.services.PlaceService;
import com.example.climaxtfg.services.WeatherService;

@SpringBootTest
@AutoConfigureMockMvc
class ClimaxTfgApplicationTests {

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private WeatherService weatherService;

    @MockitoBean
    private PlaceService placeService;

    @MockitoBean
    private MapService mapService;

    @Test
    void searchesPlaces() throws Exception {
        given(placeService.search("valencia")).willReturn(List.of(
                new Place("Valencia", "Comunidad Valenciana", "España", "ES", 39.47, -0.38)));

        mvc.perform(get("/api/places").param("q", " Valencia "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Valencia"))
                .andExpect(jsonPath("$[0].countryCode").value("ES"));
    }

    @Test
    void rejectsInvalidCoordinates() throws Exception {
        mvc.perform(get("/api/weather").param("lat", "120").param("lon", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Parámetros no válidos"));
    }

    @Test
    void reportsProviderFailuresAsBadGateway() throws Exception {
        given(weatherService.getForecast(anyDouble(), anyDouble()))
                .willThrow(new ExternalServiceException("No se pudo consultar el servicio de previsión"));

        mvc.perform(get("/api/weather").param("lat", "40.4").param("lon", "-3.7"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.detail").value("No se pudo consultar el servicio de previsión"));
    }

    @Test
    void allowsConfiguredOriginOnly() throws Exception {
        given(mapService.currentTemperatures()).willReturn(List.of());

        mvc.perform(get("/api/map/cities").header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));

        mvc.perform(get("/api/map/cities").header("Origin", "https://evil.example"))
                .andExpect(status().isForbidden());
    }

    @Test
    void isReadOnly() throws Exception {
        mvc.perform(post("/api/weather"))
                .andExpect(status().isForbidden());
    }
}
