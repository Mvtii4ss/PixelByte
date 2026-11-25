package cl.pixelbyte.pixelbyte_api.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import cl.pixelbyte.pixelbyte_api.model.RefreshSession;
public interface RefreshRepository extends JpaRepository<RefreshSession,String> {
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select s from RefreshSession s where s.hash=:hash")
 Optional<RefreshSession> lockByHash(@Param("hash") String hash);
 void deleteByUsuarioId(String usuarioId);
}
