package cl.pixelbyte.pixelbyte_api.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import cl.pixelbyte.pixelbyte_api.model.Usuario;
public interface UsuarioRepository extends JpaRepository<Usuario,String> {
 Optional<Usuario> findByEmail(String email);
 Optional<Usuario> findByGoogleSub(String googleSub);
 Optional<Usuario> findByRun(String run);
}
