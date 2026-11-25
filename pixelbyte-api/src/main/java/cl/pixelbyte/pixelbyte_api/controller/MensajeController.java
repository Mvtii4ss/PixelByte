package cl.pixelbyte.pixelbyte_api.controller;

import cl.pixelbyte.pixelbyte_api.model.Mensaje;
import cl.pixelbyte.pixelbyte_api.service.MensajeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/v1/mensajes") public class MensajeController {
 private final MensajeService service;public MensajeController(MensajeService service){this.service=service;}
 @GetMapping public List<Mensaje> listar(){return service.listar();}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public Mensaje crear(@Valid @RequestBody MensajeService.Datos d){return service.crear(d);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void eliminar(@PathVariable String id){service.eliminar(id);}
}
