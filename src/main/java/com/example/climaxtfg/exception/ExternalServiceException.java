package com.example.climaxtfg.exception;

/** Fallo al hablar con un proveedor externo (Open-Meteo, Nominatim). */
public class ExternalServiceException extends RuntimeException {

    public ExternalServiceException(String message) {
        super(message);
    }

    public ExternalServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
