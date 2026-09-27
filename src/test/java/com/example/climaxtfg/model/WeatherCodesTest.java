package com.example.climaxtfg.model;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class WeatherCodesTest {

    @ParameterizedTest
    @CsvSource({
            "0, Despejado, clear",
            "2, Parcialmente nublado, partly",
            "45, Niebla, fog",
            "63, Lluvia, rain",
            "75, Nevada intensa, snow",
            "95, Tormenta, storm"})
    void describesKnownCodes(int code, String description, String group) {
        Condition condition = WeatherCodes.describe(code);

        assertThat(condition.description()).isEqualTo(description);
        assertThat(condition.group()).isEqualTo(group);
    }

    @ParameterizedTest
    @CsvSource({"4", "100", "-1"})
    void unknownCodesFallBackToCloudy(int code) {
        assertThat(WeatherCodes.describe(code).group()).isEqualTo("cloudy");
    }
}
