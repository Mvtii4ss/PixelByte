package cl.pixelbyte.pixelbyte_api.service;

import cl.pixelbyte.pixelbyte_api.model.Mensaje;
import cl.pixelbyte.pixelbyte_api.repository.MensajeRepository;
import jakarta.validation.constraints.*;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.time.Instant;
@Service public class MensajeService {
 public record Datos(@NotBlank @Size(max=100) String nombre,@NotBlank @Email @Size(max=100) String email,@NotBlank @Size(max=500) String motivo){}
 private final MensajeRepository repo;public MensajeService(MensajeRepository repo){this.repo=repo;}
 public List<Mensaje> listar(){return repo.findAll();}
 public Mensaje crear(Datos d){var m=new Mensaje();m.id="MSG-"+UUID.randomUUID();m.nombre=d.nombre();m.email=d.email();m.motivo=d.motivo();m.fecha=Instant.now().toString();return repo.save(m);}
 public void eliminar(String id){if(!repo.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Mensaje no encontrado");repo.deleteById(id);}
}
