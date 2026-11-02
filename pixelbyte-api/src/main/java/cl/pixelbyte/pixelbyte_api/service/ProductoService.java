
package cl.pixelbyte.pixelbyte_api.service;

import cl.pixelbyte.pixelbyte_api.model.Producto;
import cl.pixelbyte.pixelbyte_api.repository.ProductoRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    // Obtener todos los productos
    public List<Producto> obtenerTodos() {
        return productoRepository.findAll();
    }

    // Buscar producto por ID
    public Optional<Producto> obtenerPorId(String id) {
        return productoRepository.findById(id);
    }

    // Crear un producto nuevo
    public Producto crear(Producto producto) {
        if (productoRepository.existsById(producto.getId())) {
            throw new IllegalArgumentException("Ya existe un producto con ese ID");
        }

        return productoRepository.save(producto);
    }

    // Actualizar un producto existente
    public Producto actualizar(String id, Producto datos) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        producto.setNombre(datos.getNombre());
        producto.setDescripcion(datos.getDescripcion());
        producto.setPrecio(datos.getPrecio());
        producto.setStock(datos.getStock());
        producto.setStockCritico(datos.getStockCritico());
        producto.setCategoria(datos.getCategoria());
        producto.setImagenUrl(datos.getImagenUrl());

        return productoRepository.save(producto);
    }

    // Eliminar un producto
    public void eliminar(String id) {
        if (!productoRepository.existsById(id)) {
            throw new IllegalArgumentException("Producto no encontrado");
        }

        productoRepository.deleteById(id);
    }
}
