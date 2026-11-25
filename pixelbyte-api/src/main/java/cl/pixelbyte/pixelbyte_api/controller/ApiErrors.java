package cl.pixelbyte.pixelbyte_api.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.Map;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(ResponseStatusException.class) public ResponseEntity<?> status(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("message",e.getReason()==null?"Solicitud inválida":e.getReason()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<?> validation(MethodArgumentNotValidException e){var f=e.getBindingResult().getFieldError();return ResponseEntity.badRequest().body(Map.of("message",f==null?"Datos inválidos":f.getField()+": "+f.getDefaultMessage()));}
 @ExceptionHandler(DataIntegrityViolationException.class) public ResponseEntity<?> conflict(DataIntegrityViolationException e){return ResponseEntity.status(409).body(Map.of("message","El registro ya existe o está relacionado con otros datos"));}
}
