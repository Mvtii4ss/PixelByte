package cl.pixelbyte.pixelbyte_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import cl.pixelbyte.pixelbyte_api.model.Orden;
public interface OrdenRepository extends JpaRepository<Orden,String>{}
