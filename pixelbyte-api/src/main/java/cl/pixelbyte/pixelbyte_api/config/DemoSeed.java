package cl.pixelbyte.pixelbyte_api.config;

import cl.pixelbyte.pixelbyte_api.model.*;
import cl.pixelbyte.pixelbyte_api.repository.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import java.util.UUID;
@Component public class DemoSeed implements ApplicationRunner {
 private final ProductoRepository products;private final UsuarioRepository users;private final SeedRepository seeds;private final PasswordEncoder encoder;private final String password;
 public DemoSeed(ProductoRepository products,UsuarioRepository users,SeedRepository seeds,PasswordEncoder encoder,@Value("${app.demo-password}") String password){this.products=products;this.users=users;this.seeds=seeds;this.encoder=encoder;this.password=password;}
 @Override @Transactional public void run(ApplicationArguments args){if(!seeds.existsById("catalog-v1")){
  add("PROD-01","Tarjeta de Video RTX 4070",650000,"https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80","Componentes");
  add("PROD-02","Teclado Mecánico RGB",45000,"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80","Periféricos");
  add("PROD-03","Mouse Gaming 16000 DPI",25000,"https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80","Periféricos");
  add("PROD-04","Audífonos 7.1 Surround",38000,"https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80","Periféricos");
  add("PROD-05","Monitor Gamer 27\" 165Hz IPS",210000,"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80","Monitores");
  add("PROD-06","Gabinete Gamer ATX Vidrio Templado",75000,"https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=400&q=80","Componentes");
  add("PROD-07","Micrófono Condensador USB Studio",52000,"https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80","Periféricos");
  add("PROD-08","Procesador AMD Ryzen 7 5700X",185000,"https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80","Componentes");
  add("PROD-09","Memoria RAM 16GB (2x8GB) DDR4 RGB",58000,"https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=400&q=80","Componentes");
  add("PROD-10","Control Inalámbrico PC / Consola",42000,"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80","Periféricos");
  add("PROD-11","Notebook Gamer RTX 4060 15.6\"",980000,"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80","Computadores");
 var marker=new SeedMarker();marker.id="catalog-v1";seeds.save(marker);}
 if(!password.isBlank()){if(password.length()<6||password.length()>10)throw new IllegalArgumentException("DEMO_PASSWORD: 6 a 10 caracteres");user("admin@duoc.cl","Admin PixelByte","Administrador");user("vendedor@profesor.duoc.cl","Vendedor Tienda","Vendedor");user("cliente@gmail.com","Juan Pérez","Cliente");}}
 private void add(String id,String name,int price,String image,String category){if(products.existsById(id))return;var p=new Producto();p.setId(id);p.setNombre(name);p.setPrecio(price);p.setImagenUrl(image);p.setCategoria(category);p.setDescripcion("Producto tecnológico del catálogo PixelByte");p.setStock(20);p.setStockCritico(3);products.save(p);}
 private void user(String email,String name,String role){if(users.findByEmail(email).isPresent())return;var u=new Usuario();u.id=UUID.randomUUID().toString();u.email=email;u.nombre=name;u.role=role;u.passwordHash=encoder.encode(password);users.save(u);}
}
