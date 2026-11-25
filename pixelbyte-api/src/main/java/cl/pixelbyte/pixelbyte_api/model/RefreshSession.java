package cl.pixelbyte.pixelbyte_api.model;

import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="sesiones_refresh")
public class RefreshSession {
 @Id @Column(length=64) public String hash;
 @Column(nullable=false,length=36) public String usuarioId;
 @Column(nullable=false) public Instant expiresAt;
}
