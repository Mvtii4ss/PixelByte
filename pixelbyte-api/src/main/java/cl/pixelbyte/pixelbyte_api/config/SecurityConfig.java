package cl.pixelbyte.pixelbyte_api.config;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import cl.pixelbyte.pixelbyte_api.repository.UsuarioRepository;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean SecretKey jwtKey(@Value("${app.jwt-secret}") String secret){byte[] key=secret.getBytes(StandardCharsets.UTF_8);if(key.length==0){key=new byte[32];new SecureRandom().nextBytes(key);}else if(key.length<32)throw new IllegalArgumentException("JWT_SECRET requiere al menos 32 bytes");return new SecretKeySpec(key,"HmacSHA256");}
 @Bean JwtDecoder jwtDecoder(SecretKey key){var decoder=NimbusJwtDecoder.withSecretKey(key).build();decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("pixelbyte"));return decoder;}
 @Bean SecurityFilterChain filter(HttpSecurity http,UsuarioRepository users) throws Exception {
  http.cors(c->{}).csrf(c->c.disable()).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
  .authorizeHttpRequests(a->a.requestMatchers(HttpMethod.OPTIONS,"/**").permitAll()
  .requestMatchers("/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**","/error").permitAll()
  .requestMatchers(HttpMethod.POST,"/api/v1/auth/login","/api/v1/auth/google","/api/v1/auth/registro","/api/v1/auth/refresh","/api/v1/auth/logout").permitAll()
  .requestMatchers(HttpMethod.GET,"/api/v1/auth/me").authenticated()
  .requestMatchers(HttpMethod.GET,"/api/v1/productos/**","/api/v1/productos").permitAll()
  .requestMatchers("/api/v1/productos/**","/api/v1/productos","/api/v1/usuarios/**","/api/v1/usuarios").hasRole("Administrador")
  .requestMatchers(HttpMethod.POST,"/api/v1/mensajes").permitAll()
  .requestMatchers("/api/v1/mensajes/**","/api/v1/mensajes").hasRole("Administrador")
  .requestMatchers(HttpMethod.GET,"/api/v1/ordenes/**","/api/v1/ordenes").hasAnyRole("Administrador","Vendedor")
  .requestMatchers(HttpMethod.POST,"/api/v1/ordenes").hasAnyRole("Cliente","Administrador")
  .requestMatchers("/api/v1/ordenes/**","/api/v1/ordenes").hasRole("Administrador").anyRequest().denyAll())
  .oauth2ResourceServer(o->o.jwt(j->j.jwtAuthenticationConverter(jwt->{var u=users.findById(jwt.getSubject()).orElseThrow(()->new OAuth2AuthenticationException(new OAuth2Error("invalid_token")));return new JwtAuthenticationToken(jwt,List.of(new SimpleGrantedAuthority("ROLE_"+u.role)),u.id);})));return http.build();
 }
 @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-origin}") String origin){var c=new CorsConfiguration();c.setAllowedOrigins(List.of(origin));c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("Authorization","Content-Type"));c.setAllowCredentials(true);var s=new UrlBasedCorsConfigurationSource();s.registerCorsConfiguration("/**",c);return s;}
 @Bean OpenAPI api(){return new OpenAPI().info(new Info().title("PixelByte API REST").version("v1").description("Tienda tecnológica: productos, usuarios, órdenes y mensajes. Login devuelve JWT Bearer.")).components(new Components().addSecuritySchemes("bearerAuth",new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT"))).addSecurityItem(new SecurityRequirement().addList("bearerAuth"));}
}
