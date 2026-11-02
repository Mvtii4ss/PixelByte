package cl.pixelbyte.pixelbyte_api.controller;

import cl.pixelbyte.pixelbyte_api.model.Producto;
import cl.pixelbyte.pixelbyte_api.service.ProductoService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    // GET: obtener todos los productos
    @GetMapping
    public List<Producto> listar() {
        return productoService.obtenerTodos();
    }

    // GET: buscar un producto por su ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscar(@PathVariable String id) {
        return productoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST: crear un producto
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Producto producto) {
        try {
            Producto creado = productoService.crear(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT: actualizar un producto
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable String id,
            @Valid @RequestBody Producto datos) {
        try {
            return ResponseEntity.ok(productoService.actualizar(id, datos));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // DELETE: eliminar un producto
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id) {
        try {
            productoService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}
