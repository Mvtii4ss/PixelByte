package cl.pixelbyte.pixelbyte_api;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import cl.pixelbyte.pixelbyte_api.model.Producto;
import cl.pixelbyte.pixelbyte_api.service.OrdenService;
import cl.pixelbyte.pixelbyte_api.service.UsuarioService;
class ReglasNegocioTests {
 @Test void run(){assertTrue(UsuarioService.validarRun("123456785"));assertFalse(UsuarioService.validarRun("12345678K"));}
 @Test void oferta(){Producto p=new Producto();p.setId("PROD-01");p.setPrecio(650000);assertEquals(552500,OrdenService.precioFinal(p));p.setId("OTRO");assertEquals(650000,OrdenService.precioFinal(p));}
}
