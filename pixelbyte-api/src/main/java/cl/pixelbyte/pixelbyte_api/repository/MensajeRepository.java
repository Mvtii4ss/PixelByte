package cl.pixelbyte.pixelbyte_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import cl.pixelbyte.pixelbyte_api.model.Mensaje;
public interface MensajeRepository extends JpaRepository<Mensaje,String>{}
