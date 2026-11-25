package cl.pixelbyte.pixelbyte_api.controller;

import cl.pixelbyte.pixelbyte_api.service.OrdenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
@RestController @RequestMapping("/api/v1/ordenes")
public class OrdenController {
 record Estado(@NotBlank String estado){}
 private final OrdenService service;public OrdenController(OrdenService service){this.service=service;}
 @GetMapping public List<OrdenService.Vista> listar(){return service.listar();}
 @GetMapping("/{id}") public OrdenService.Vista buscar(@PathVariable String id){return service.buscar(id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public OrdenService.Vista crear(@Valid @RequestBody OrdenService.Compra c,Principal p){return service.crear(c,p.getName());}
 @PutMapping("/{id}") public OrdenService.Vista actualizar(@PathVariable String id,@Valid @RequestBody Estado e){return service.estado(id,e.estado());}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void eliminar(@PathVariable String id){service.eliminar(id);}
}
