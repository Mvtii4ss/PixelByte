package cl.pixelbyte.pixelbyte_api.repository;

import cl.pixelbyte.pixelbyte_api.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id=:id")
    Optional<Producto> lockById(@Param("id") String id);

}
