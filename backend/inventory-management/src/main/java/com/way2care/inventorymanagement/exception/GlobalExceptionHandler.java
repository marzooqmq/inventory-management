package com.way2care.inventorymanagement.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
       String errorMessage = ex.getBindingResult().getFieldErrors()
               .stream()
               .map(error -> error.getField() + ": " + error.getDefaultMessage())
               .findFirst().orElse("Invalid input");

       Map<String, Object> response = Map.of(
               "status", HttpStatus.BAD_REQUEST.value(),
               "error", "Validation Failed",
               "message", errorMessage
       );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<Map<String,Object>> handleInsufficientStockException(InsufficientStockException ex) {
        Map<String, Object> response = Map.of(
                "status", HttpStatus.CONFLICT.value(),
                "error", "Insufficient Stock",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> response = Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Bad Request",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Object> handleIllegalStateException(IllegalStateException ex) {
        Map<String, Object> response = Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Bad Request",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        Map<String, Object> response = Map.of(
                "status", HttpStatus.NOT_FOUND.value(),
                "error", "Not Found",
                "message", ex.getMessage()
        );
        return ResponseEntity.status(404).body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(
            ResponseStatusException ex) {

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of(
                        "status", ex.getStatusCode().value(),
                        "message", ex.getReason(),
                        "timestamp", LocalDateTime.now()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "status", HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "error", ex.getClass().getSimpleName(),
                        "message", ex.getMessage() != null ? ex.getMessage(): "Unexpected error occurred",
                        "timestamp", LocalDateTime.now()
                ));
    }
}
