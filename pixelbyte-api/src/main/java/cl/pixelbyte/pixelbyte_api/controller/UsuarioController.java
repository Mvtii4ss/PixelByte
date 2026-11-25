package cl.pixelbyte.pixelbyte_api.controller;

import cl.pixelbyte.pixelbyte_api.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
@RestController @RequestMapping("/api/v1/usuarios")
public class UsuarioController {
 private final UsuarioService users;public UsuarioController(UsuarioService users){this.users=users;}
 @GetMapping public List<UsuarioService.Vista> listar(){return users.listar();}
 @GetMapping("/{id}") public UsuarioService.Vista buscar(@PathVariable String id){return users.vista(users.buscar(id));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public UsuarioService.Vista crear(@Valid @RequestBody UsuarioService.Datos d){return users.crear(d,true);}
 @PutMapping("/{id}") public UsuarioService.Vista actualizar(@PathVariable String id,@Valid @RequestBody UsuarioService.Datos d,Principal p){return users.actualizar(id,d,p.getName());}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void eliminar(@PathVariable String id,Principal p){users.eliminar(id,p.getName());}
}
