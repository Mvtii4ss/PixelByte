# Guía de entrega — Evaluación 3

## Capturas nuevas (hacer con la versión final, no inventar resultados)
1. `03_Swagger_v1.png`: todos los controladores y rutas /api/v1. `04_GET_Catalogo.png`: GET productos 200, catálogo con registros.
2. `05_MySQL.png`: Workbench con `SHOW TABLES;` y `SELECT id,nombre,precio,stock FROM productos;` (no mostrar contraseñas/hashes).
3. `06_Catalogo_React.png`: pantalla inicio/productos. `07_Integracion_Network.png`: DevTools → Network → GET /api/v1/productos 200, response (sin tokens).
4. `08_Login.png`: login normal y botón Google. `09_Google.png`: usuario autenticado por Google (ocultar correo personal si se requiere). `10_Sesion_Recarga.png`: recarga, sesión conservada.
5. `11_Admin.png`: resumen. `12_Crear.png`, `13_Editar.png`, `14_Eliminar.png`: CRUD producto demo y consulta GET/MySQL. `15_Usuarios.png`: roles del mantenedor. `16_Vendedor.png`: panel solo consulta. `17_403.png`: vendedor intenta POST /productos por Swagger, respuesta 403 (no mostrar JWT).
6. `18_Carrito.png`, `19_Checkout.png`, `20_Orden.png`: compra simulada y persistencia en Admin; verificar descuento de stock. `21_Mensajes.png`: envío contacto y bandeja admin.
7. `22_Test_API.png`: salida real `node scripts/probar-api.mjs`; `23_Vitest.png`: salida de `npm.cmd run test:run`; `24_Maven_Test.png`: salida real Maven.
8. `25_GitHub.png`: dos repos públicos separados con commits reales, sin secretos.

## Entregables exigidos
- Enlaces públicos frontend y backend (crear/publicar en GitHub; no incluidos como enlaces inventados).
- ZIP frontend y backend (se incluyen por separado además de ZIP completo).
- ERS versión 3, Anexo 2 integración, Anexo 3 APIs y Anexo 4 manual. Completar campos de evidencias con capturas reales y resultados. Las evidencias previas de Swagger son de la versión anterior.

## Defensa oral
1. Arquitectura React → fetch → controlador REST → servicio → repositorio JPA → MySQL. Ejemplo GET productos y modificación del inventario.
2. CRUD y Swagger: GET 200, POST 201, PUT 200, DELETE 204; validación 400, inexistente 404, sin autenticación 401, permiso insuficiente 403.
3. Login: BCrypt compara contraseña; JWT firmado, expiración, filtro Spring Security. La cuenta Google se valida por firma/issuer/audience y recibe rol Cliente. No aceptar roles del registro público.
4. Refresh: cookie HttpOnly y registro hash en DB, rotación en cada renovación; recarga React hace POST refresh. CORS permite el origen del frontend. Token de acceso no se escribe en localStorage.
5. Roles: ruta Admin/Vendedor en React y autorización real en backend; demostrar 403 con vendedor. Mostrar compra: precio calculado en servidor, stock decrementado de forma transaccional, pago simulado.
6. Explicar resultados reales de las pruebas y contribuciones en GitHub; no inventar cobertura ni commits.
