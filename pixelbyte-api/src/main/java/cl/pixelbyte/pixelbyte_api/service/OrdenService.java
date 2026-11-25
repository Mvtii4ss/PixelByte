package cl.pixelbyte.pixelbyte_api.service;

import cl.pixelbyte.pixelbyte_api.model.*;
import cl.pixelbyte.pixelbyte_api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import java.time.Instant;
@Service public class OrdenService {
 public record Entrega(@NotBlank @Size(max=100) String nombre,@NotBlank @Email @Size(max=100) String email,@NotBlank @Size(max=100) String region,@NotBlank @Size(max=100) String comuna,@NotBlank @Size(max=300) String direccion,@Size(max=300) String indicaciones,@Pattern(regexp="estandar|retiro") String envio){}
 public record Linea(@NotBlank @Size(max=30) String id,@Min(1) @Max(1000) int quantity){}
 public record Compra(@NotNull @Valid Entrega cliente,@NotEmpty @Size(max=100) List<@NotNull @Valid Linea> items){}
 public record Vista(String id,String fecha,Orden.Cliente cliente,List<Orden.Item> items,long total,String estado){}
 private final OrdenRepository repo;private final ProductoRepository products;private final UsuarioService users;
 public OrdenService(OrdenRepository repo,ProductoRepository products,UsuarioService users){this.repo=repo;this.products=products;this.users=users;}
 private Vista vista(Orden o){return new Vista(o.id,o.fecha,o.cliente,new ArrayList<>(o.items),o.total,o.estado);}
 @Transactional(readOnly=true) public List<Vista> listar(){return repo.findAll().stream().map(this::vista).toList();}
 @Transactional(readOnly=true) public Vista buscar(String id){return vista(get(id));}
 private Orden get(String id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Orden no encontrada"));}
 public static int precioFinal(Producto p){int descuento=switch(p.getId()){case "PROD-01"->15;case "PROD-05"->10;case "PROD-08"->20;default->0;};return (int)Math.round(p.getPrecio()*(100.0-descuento)/100.0);}
 @Transactional public Vista crear(Compra c,String actor){var o=new Orden();o.id="PB-"+UUID.randomUUID();o.usuario=users.buscar(actor);o.fecha=Instant.now().toString();o.estado="Aprobado (simulación)";var e=c.cliente();var d=new Orden.Cliente();d.nombre=e.nombre();d.email=e.email();d.region=e.region();d.comuna=e.comuna();d.direccion=e.direccion();d.indicaciones=e.indicaciones();d.envio=e.envio()==null?"estandar":e.envio();o.cliente=d;
 var cantidades=new TreeMap<String,Integer>();for(var l:c.items())cantidades.merge(l.id(),l.quantity(),Integer::sum);
 for(var entry:cantidades.entrySet()){var p=products.lockById(entry.getKey()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado: "+entry.getKey()));int q=entry.getValue();if(q>p.getStock())throw new ResponseStatusException(HttpStatus.CONFLICT,"Stock insuficiente: "+p.getNombre());var i=new Orden.Item();i.id=p.getId();i.name=p.getNombre();i.price=precioFinal(p);i.quantity=q;o.items.add(i);o.total+=(long)i.price*q;p.setStock(p.getStock()-q);}
 return vista(repo.save(o));}
 @Transactional public Vista estado(String id,String estado){var o=get(id);if(!List.of("Aprobado (simulación)","Preparando","Enviado","Entregado").contains(estado))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Estado inválido");o.estado=estado;return vista(o);}
 // Eliminación administrativa del historial; no implica devolución de inventario.
 @Transactional public void eliminar(String id){repo.delete(get(id));}
}
