package com.example.climaxtfg.services;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;

import org.junit.jupiter.api.Test;

import com.example.climaxtfg.model.Forecast;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class ForecastMapperTest {

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void mapsRealOpenMeteoResponse() throws IOException {
        Forecast forecast = ForecastMapper.toForecast(fixture("forecast-madrid.json"), fixture("air-madrid.json"));

        assertThat(forecast.location().timezone()).isEqualTo("Europe/Madrid");
        assertThat(forecast.current().condition().description()).isNotBlank();
        assertThat(forecast.daily()).hasSize(7);
        assertThat(forecast.hourly()).hasSize(ForecastMapper.HOURS_AHEAD);
        assertThat(forecast.airQuality().europeanAqi()).isEqualTo(22);
    }

    @Test
    void hourlySeriesStartsAtTheCurrentHour() throws IOException {
        Forecast forecast = ForecastMapper.toForecast(fixture("forecast-madrid.json"), null);

        String currentHour = forecast.current().time().substring(0, 13);
        assertThat(forecast.hourly().get(0).time()).startsWith(currentHour);
    }

    @Test
    void airQualityIsOptional() throws IOException {
        Forecast forecast = ForecastMapper.toForecast(fixture("forecast-madrid.json"), null);

        assertThat(forecast.airQuality()).isNull();
    }

    private JsonNode fixture(String name) throws IOException {
        try (InputStream in = getClass().getResourceAsStream("/fixtures/" + name)) {
            return json.readTree(in);
        }
    }
}
