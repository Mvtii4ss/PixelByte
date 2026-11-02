package cl.pixelbyte.pixelbyte_api.repository;

import cl.pixelbyte.pixelbyte_api.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, String> {

}
