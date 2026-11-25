package cl.pixelbyte.pixelbyte_api.controller;

import cl.pixelbyte.pixelbyte_api.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.time.Duration;
@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
 record Login(@NotBlank @Email String email,@NotBlank @Size(max=72) String password){}
 record Google(@NotBlank String credential){}
 record Access(String accessToken,UsuarioService.Vista usuario){}
 private final AuthService auth;private final UsuarioService users;private final String origin;private final boolean secure;
 public AuthController(AuthService auth,UsuarioService users,@Value("${app.frontend-origin}") String origin,@Value("${app.cookie-secure}") boolean secure){this.auth=auth;this.users=users;this.origin=origin;this.secure=secure;}
 private void checkOrigin(HttpServletRequest req){String o=req.getHeader("Origin");if(o!=null&&!o.equals(origin)&&!o.equals(req.getScheme()+"://"+req.getServerName()+":"+req.getServerPort()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Origen no autorizado");}
 private ResponseCookie cookie(String raw,long seconds){return ResponseCookie.from("pb_refresh",raw).httpOnly(true).secure(secure).sameSite("Strict").path("/api/v1/auth").maxAge(Duration.ofSeconds(seconds)).build();}
 private ResponseEntity<Access> response(AuthService.Session s){return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,cookie(s.refresh(),604800).toString()).cacheControl(CacheControl.noStore()).body(new Access(s.accessToken(),s.usuario()));}
 @PostMapping("/login") public ResponseEntity<Access> login(@Valid @RequestBody Login data,HttpServletRequest req,@CookieValue(value="pb_refresh",required=false) String raw){checkOrigin(req);var u=users.login(data.email(),data.password());auth.revoke(raw);return response(auth.issue(u));}
 @PostMapping("/google") public ResponseEntity<Access> google(@Valid @RequestBody Google data,HttpServletRequest req,@CookieValue(value="pb_refresh",required=false) String raw){checkOrigin(req);var u=auth.google(data.credential());auth.revoke(raw);return response(auth.issue(u));}
 @PostMapping("/registro") @ResponseStatus(HttpStatus.CREATED) public UsuarioService.Vista registro(@Valid @RequestBody UsuarioService.Datos d){return users.crear(d,false);}
 @PostMapping("/refresh") public ResponseEntity<Access> refresh(@CookieValue(value="pb_refresh",required=false) String raw,HttpServletRequest req){checkOrigin(req);return response(auth.rotate(raw));}
 @PostMapping("/logout") public ResponseEntity<Void> logout(@CookieValue(value="pb_refresh",required=false) String raw,HttpServletRequest req){checkOrigin(req);auth.revoke(raw);return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE,cookie("",0).toString()).build();}
 @GetMapping("/me") public UsuarioService.Vista me(Principal p){return users.vista(users.buscar(p.getName()));}
}
