# PixelByte | Evaluación Parcial 3 — DSY1104

Tienda de hardware desarrollada en React + Bootstrap + Spring Boot 4.1.2 + MySQL. Se conserva la interfaz de las entregas anteriores. La versión anterior está en el ZIP original; los HTML y JS legados que simulaban autenticación ya no se incluyen en la versión activa.

## Inicio rápido en Windows (PowerShell)

Requisitos: MySQL 8 iniciado, Java 21 o superior (se conservó el `release 21`), Node compatible con el `package-lock.json` original (preferiblemente la misma versión que usaste con Vite, o Node 24.15+), acceso a Maven Central y npm para dependencias. No ejecutar sobre el proyecto anterior ni borrar la base. Detén el backend/frontend anterior antes de arrancar esta copia. El esquema `pixelbyte_db` se actualiza mediante Hibernate; realiza respaldo si tienes datos importantes. La primera ejecución agrega los 11 productos originales que no existan (stock demo 20, crítico 3, sin sobrescribir registros existentes). La marca de inicialización evita reinsertar productos eliminados.

1. Abre la carpeta que contiene este README en VS Code. Terminal 1:

```powershell
cd pixelbyte-api
$env:DB_PASSWORD = Read-Host 'Contraseña MySQL'
$env:DEMO_PASSWORD = Read-Host 'Clave DEMO (6 a 10 caracteres)'
.\mvnw.cmd spring-boot:run
```

Usa una clave exclusivamente de demostración, distinta de tu contraseña de MySQL. El servidor crea una sola vez las cuentas `admin@duoc.cl`, `vendedor@profesor.duoc.cl` y `cliente@gmail.com` con esta clave. Si las cuentas ya existen, el seed no cambia su contraseña; usa la primera que elegiste. Sin `DEMO_PASSWORD` no se crean cuentas privilegiadas. No incluyas claves en GitHub.

2. Terminal 2, desde la raíz (no dentro de `pixelbyte-api`):

```powershell
npm.cmd ci
npm.cmd run dev -- --strictPort
```

- Tienda: http://localhost:5173
- Swagger: http://localhost:8080/swagger-ui.html
- Catálogo REST: http://localhost:8080/api/v1/productos

Alternativa: `INICIAR-BACKEND.ps1` y `INICIAR-FRONTEND.ps1` (si la política PowerShell impide ejecutarlos, usar comandos anteriores). Mantener ambas terminales abiertas. En una terminal nueva vuelve a definir las variables. `DB_USER` (root por defecto), `DB_URL` y `PORT` son opcionales. Si quieres conservar las sesiones tras reiniciar el backend, la renovación usa cookies y MySQL; configura además `JWT_SECRET` como secreto aleatorio de 32+ bytes para una clave de firma estable. Si se omite, se genera una clave aleatoria por ejecución. Para producción usar HTTPS, `COOKIE_SECURE=true`, `FRONTEND_ORIGIN` real, base con usuario de mínimo privilegio y gestión de secretos. Demo no destinada a producción.

## Google Sign-In (requisito adicional del docente)

1. En https://console.cloud.google.com/ crea/elige proyecto. En Google Auth Platform configura Branding, Audience (External si usarás Gmail, añade tu correo como usuario de prueba si corresponde), Data Access (OpenID/email/profile) y Clients.
2. Crea cliente OAuth de tipo **Web application**. Authorized JavaScript origins: `http://localhost:5173` (sin barra final; usa exactamente localhost, no 127.0.0.1). No hace falta URI de redirect para el botón GIS con callback JavaScript. Copia el **Client ID**, no el client secret.
3. Antes de iniciar backend (en su propia terminal): `$env:GOOGLE_CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com'`. Mantén DB_PASSWORD y DEMO_PASSWORD. Reinicia backend.
4. En raíz frontend: `Copy-Item .env.example .env.local` y edita `.env.local`: `VITE_GOOGLE_CLIENT_ID=TU_CLIENT_ID.apps.googleusercontent.com` (idéntico al backend). Reinicia Vite. El archivo .env.local está ignorado por Git. Client ID es identificador público, no contraseña.
5. Ve a Iniciar sesión → botón Google. La API valida firma RS256, emisor, vigencia, audience y email verificado. Crea un usuario Cliente asociado al `sub` de Google, sin contraseña local. Se restringe a los dominios existentes del proyecto; si el correo ya tiene una cuenta local, no se vincula automáticamente (evita apropiación de cuenta). Debes usar una cuenta Google distinta de las tres demo y del registro local previo.

## Cambios técnicos
- Servicios `src/services/api.js`, `productos.js`, `usuarios.js`, `sesion.js`: fetch JSON, adaptación DTO, manejo HTTP. El catálogo, usuarios, órdenes y mensajes ya no dependen de localStorage; el carrito sí permanece en el navegador. Se limpian antiguas claves de sesión/datos locales al iniciar la SPA; no se migran usuarios antiguos con claves en texto plano.
- `controller`, `service`, `repository`, `model`, `config`: entidades JPA, controladores v1, negocio, configuración CORS y Spring Security. Roles aplicados también en backend. Contraseñas BCrypt; JWT HS256 de 15 min en memoria; refresh opaco aleatorio de 7 días en cookie HttpOnly SameSite=Strict, hash SHA-256 almacenado en MySQL y rotación de un solo uso. Se restaura sesión al recargar. Cerrar sesión revoca refresh; access token previo expira por TTL, no se revoca individualmente.
- Checkout exige login, conserva pago simulado, recalcula precios/ofertas y stock en transacción con bloqueo de producto; no acepta el total del cliente. Orden almacena snapshot de precio y entrega. Eliminar historial no repone stock. El precio mostrado en un carrito antiguo puede variar al confirmar si el administrador lo modificó.
- Vendedor: consultar inventario, detalle y órdenes; no editar. Cliente: tienda y compra, sin paneles. Admin: productos, usuarios, mensajes, órdenes. API protegida por rol de MySQL consultado por cada solicitud autenticada.
- Swagger /api/v1 + Authorize (Bearer). Ejecutar POST `/api/v1/auth/login` con cuenta demo, copiar solamente `accessToken` y pegar en Authorize. No pegar tokens en capturas públicas.

## Verificación (obligatoria antes de entregar)

- `npm.cmd run test:run` (14 pruebas Vitest adaptadas; HTTP simulado).
- En `pixelbyte-api`: `$env:DB_PASSWORD=Read-Host 'Contraseña MySQL'` y `.\mvnw.cmd test` (contexto requiere MySQL; pruebas de RUN y descuento).
- Backend en ejecución y en otra terminal desde la raíz: `$env:DEMO_PASSWORD=Read-Host 'Clave DEMO'` y `node scripts/probar-api.mjs`. Verifica REST real, 401/403, login de tres roles, CRUD, stock, órdenes, rotación de refresh y limpieza de registros de prueba. No comprueba Google (requiere credenciales y navegador).
- Probar visualmente catálogo, CRUD desde Admin, registro, login/recarga/logout, Google, vendedor, pago de prueba y mensajes. Capturas según `documentos/GUIA_ENTREGA.md`.

**Estado de verificación de esta copia:** análisis sintáctico Java/JSX correcto. Maven, npm y MySQL/Google no se pudieron ejecutar integralmente en el entorno de preparación (sin dependencias/red). Las capturas anteriores aportadas por el estudiante corresponden al CRUD previo sin versionado y no prueban esta versión. No se certifica la ejecución final hasta probarla localmente.
