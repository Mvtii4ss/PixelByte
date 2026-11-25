package cl.pixelbyte.pixelbyte_api.service;

import java.time.*;
import java.util.*;
import java.security.*;
import javax.crypto.SecretKey;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.*;
import cl.pixelbyte.pixelbyte_api.model.*;
import cl.pixelbyte.pixelbyte_api.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service
public class AuthService {
 public record Session(String accessToken,UsuarioService.Vista usuario,String refresh){}
 private final SecretKey key;private final RefreshRepository repo;private final UsuarioService users;private final String googleId;private final SecureRandom random=new SecureRandom();
 private volatile JwtDecoder googleDecoder;
 public AuthService(SecretKey key,RefreshRepository repo,UsuarioService users,@Value("${app.google-client-id}") String googleId){this.key=key;this.repo=repo;this.users=users;this.googleId=googleId;}
 private String hash(String raw){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
 @Transactional public Session issue(Usuario u){try{var now=Instant.now();var jwt=new SignedJWT(new JWSHeader(JWSAlgorithm.HS256),new JWTClaimsSet.Builder().issuer("pixelbyte").subject(u.id).issueTime(Date.from(now)).expirationTime(Date.from(now.plusSeconds(900))).jwtID(UUID.randomUUID().toString()).claim("role",u.role).build());jwt.sign(new MACSigner(key.getEncoded()));byte[] bytes=new byte[32];random.nextBytes(bytes);String raw=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);var session=new RefreshSession();session.hash=hash(raw);session.usuarioId=u.id;session.expiresAt=now.plus(Duration.ofDays(7));repo.save(session);return new Session(jwt.serialize(),users.vista(u),raw);}catch(JOSEException e){throw new IllegalStateException(e);}}
 @Transactional public Session rotate(String raw){if(raw==null||raw.isBlank())throw unauthorized();var s=repo.lockByHash(hash(raw)).orElseThrow(this::unauthorized);if(s.expiresAt.isBefore(Instant.now()))throw unauthorized();repo.delete(s);return issue(users.buscar(s.usuarioId));}
 @Transactional public void revoke(String raw){if(raw!=null)repo.lockByHash(hash(raw)).ifPresent(repo::delete);}
 public Usuario google(String token){if(googleId.isBlank())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Configura GOOGLE_CLIENT_ID");try{if(googleDecoder==null){var d=NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").jwsAlgorithm(org.springframework.security.oauth2.jose.jws.SignatureAlgorithm.RS256).build();d.setJwtValidator(JwtValidators.createDefaultWithIssuer("https://accounts.google.com"));googleDecoder=d;}var jwt=googleDecoder.decode(token);if(!jwt.getAudience().contains(googleId)||!Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))||jwt.getSubject()==null||jwt.getClaimAsString("email")==null)throw unauthorized();String email=jwt.getClaimAsString("email");if(!email.toLowerCase(Locale.ROOT).matches("[^@\\s]+@(gmail\\.com|duoc\\.cl|profesor\\.duoc\\.cl)"))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Dominio no permitido");return users.google(jwt.getSubject(),email,jwt.getClaimAsString("name"));}catch(JwtException e){throw unauthorized();}}
 private ResponseStatusException unauthorized(){return new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credencial inválida o vencida");}
}
