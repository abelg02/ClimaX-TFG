package com.example.climaxtfg.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolationException;

/** Errores en formato RFC 9457 (application/problem+json). */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ExternalServiceException.class)
    public ProblemDetail handleExternal(ExternalServiceException e) {
        log.warn("{}: {}", e.getMessage(), e.getCause() != null ? e.getCause().getMessage() : "-");
        return problem(HttpStatus.BAD_GATEWAY, "Proveedor meteorológico no disponible", e.getMessage());
    }

    @ExceptionHandler({
            HandlerMethodValidationException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            ConstraintViolationException.class})
    public ProblemDetail handleBadRequest(Exception e) {
        return problem(HttpStatus.BAD_REQUEST, "Parámetros no válidos",
                "Revisa los parámetros: latitud entre -90 y 90, longitud entre -180 y 180 "
                        + "y búsquedas de 2 a 80 caracteres.");
    }

    private static ProblemDetail problem(HttpStatus status, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        return problem;
    }
}
