package com.example.climaxtfg.model;

/**
 * Estado del cielo legible por humanos.
 *
 * @param code        código WMO original
 * @param description texto en español
 * @param group       familia visual (clear, partly, cloudy, fog, drizzle, rain, snow, storm)
 */
public record Condition(int code, String description, String group) {
}
