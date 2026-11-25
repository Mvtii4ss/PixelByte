package cl.pixelbyte.pixelbyte_api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import cl.pixelbyte.pixelbyte_api.model.SeedMarker;
public interface SeedRepository extends JpaRepository<SeedMarker,String>{}
