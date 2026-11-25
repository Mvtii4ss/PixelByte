package cl.pixelbyte.pixelbyte_api.service;

import cl.pixelbyte.pixelbyte_api.model.Usuario;
import cl.pixelbyte.pixelbyte_api.repository.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import jakarta.validation.constraints.*;
@Service
public class UsuarioService {
 public record Datos(@Size(max=9) String run,@NotBlank @Size(max=50) String nombre,@Size(max=100) String apellidos,
 @NotBlank @Email @Size(max=100) String email,@Size(min=4,max=10) String password,String role,@Size(max=10) String fechaNac,
 @Size(max=100) String region,@Size(max=100) String comuna,@Size(max=300) String direccion) {}
 public record Vista(String id,String run,String nombre,String apellidos,String email,String role,String fechaNac,String region,String comuna,String direccion) {}
 private final UsuarioRepository repo; private final PasswordEncoder encoder; private final RefreshRepository refresh;
 public UsuarioService(UsuarioRepository repo,PasswordEncoder encoder,RefreshRepository refresh){this.repo=repo;this.encoder=encoder;this.refresh=refresh;}
 public Vista vista(Usuario u){return new Vista(u.id,u.run,u.nombre,u.apellidos,u.email,u.role,u.fechaNac,u.region,u.comuna,u.direccion);}
 public List<Vista> listar(){return repo.findAll().stream().map(this::vista).toList();}
 public Usuario buscar(String id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuario no encontrado"));}
 public Usuario login(String email,String password){var u=repo.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElse(null);if(u==null||u.passwordHash==null||!encoder.matches(password,u.passwordHash))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Correo o contraseña incorrectos");return u;}
 @Transactional public Vista crear(Datos d,boolean admin){Usuario u=new Usuario();u.id=UUID.randomUUID().toString();if(d.password()==null||d.password().isBlank())throw bad("Contraseña requerida");aplicar(u,d,admin);return vista(repo.save(u));}
 @Transactional public Vista actualizar(String id,Datos d,String actor){Usuario u=buscar(id);if(id.equals(actor)&&!Objects.equals(u.role,d.role()))throw bad("No puedes modificar tu propio rol");aplicar(u,d,true);return vista(repo.save(u));}
 @Transactional public void eliminar(String id,String actor){if(id.equals(actor))throw bad("No puedes eliminar tu propia cuenta");buscar(id);refresh.deleteByUsuarioId(id);repo.deleteById(id);}
 private void aplicar(Usuario u,Datos d,boolean admin){String email=d.email().trim().toLowerCase(Locale.ROOT);if(!email.matches("[^@\\s]+@(gmail\\.com|duoc\\.cl|profesor\\.duoc\\.cl)"))throw bad("Dominio de correo no permitido");
 if(u.googleSub!=null&&!email.equals(u.email))throw bad("No se puede cambiar el correo de una cuenta Google");
 repo.findByEmail(email).filter(x->!x.id.equals(u.id)).ifPresent(x->{throw new ResponseStatusException(HttpStatus.CONFLICT,"Correo ya registrado");});
 String run=d.run()==null||d.run().isBlank()?null:d.run().trim().toUpperCase(Locale.ROOT);
 if(run!=null){if(!validarRun(run))throw bad("RUN inválido");repo.findByRun(run).filter(x->!x.id.equals(u.id)).ifPresent(x->{throw new ResponseStatusException(HttpStatus.CONFLICT,"RUN ya registrado");});}
 if(!admin&&(run==null||blank(d.apellidos())||blank(d.region())||blank(d.comuna())||blank(d.direccion())))throw bad("Completa los datos de registro");
 String role=admin?d.role():"Cliente";if(role==null||!List.of("Administrador","Vendedor","Cliente").contains(role))throw bad("Rol inválido");
 u.email=email;u.run=run;u.nombre=d.nombre().trim();u.apellidos=d.apellidos();u.role=role;u.fechaNac=d.fechaNac();u.region=d.region();u.comuna=d.comuna();u.direccion=d.direccion();
 if(d.password()!=null&&!d.password().isBlank()){if(d.password().length()<4||d.password().length()>10||d.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)throw bad("Contraseña inválida");u.passwordHash=encoder.encode(d.password());}}
 public static boolean validarRun(String r){if(!r.matches("[0-9]{7,8}[0-9K]"))return false;int sum=0,m=2;for(int i=r.length()-2;i>=0;i--){sum+=(r.charAt(i)-'0')*m;m=m==7?2:m+1;}int v=11-sum%11;return r.charAt(r.length()-1)==(v==11?'0':v==10?'K':(char)('0'+v));}
 private boolean blank(String s){return s==null||s.isBlank();}
 private ResponseStatusException bad(String s){return new ResponseStatusException(HttpStatus.BAD_REQUEST,s);}
 @Transactional public Usuario google(String sub,String email,String nombre){var existing=repo.findByGoogleSub(sub);if(existing.isPresent())return existing.get();email=email.toLowerCase(Locale.ROOT);if(repo.findByEmail(email).isPresent())throw new ResponseStatusException(HttpStatus.CONFLICT,"Ya existe una cuenta con ese correo. Ingresa con su contraseña.");Usuario u=new Usuario();u.id=UUID.randomUUID().toString();u.email=email;u.nombre=nombre==null||nombre.isBlank()?email.substring(0,email.indexOf('@')):nombre;u.nombre=u.nombre.substring(0,Math.min(50,u.nombre.length()));u.googleSub=sub;u.role="Cliente";return repo.save(u);}
}
