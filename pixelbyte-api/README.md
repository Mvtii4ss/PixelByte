# PixelByte API v1
Java 21+, Spring Boot 4.1.2, MySQL 8. Configuración por entorno, sin contraseñas en el código.

PowerShell en este directorio:
```powershell
$env:DB_PASSWORD = Read-Host 'Contraseña MySQL'
$env:DEMO_PASSWORD = Read-Host 'Clave de prueba (6 a 10 caracteres)'
# Opcional: $env:GOOGLE_CLIENT_ID = 'client-id de Google'
.\mvnw.cmd spring-boot:run
```
Swagger: http://localhost:8080/swagger-ui.html. API: http://localhost:8080/api/v1/productos. El seed carga 11 productos y crea cuentas demo si se configura DEMO_PASSWORD. Admin `admin@duoc.cl`, vendedor `vendedor@profesor.duoc.cl`, cliente `cliente@gmail.com`. Los roles se comprueban en Spring Security. Para endpoints privados enviar `Authorization: Bearer <accessToken>` obtenido en `/api/v1/auth/login`. Renovar con `/api/v1/auth/refresh` usando cookie `pb_refresh`; revocación en `/auth/logout`. Google requiere client ID idéntico al de React. Variables opcionales DB_USER, DB_URL, JWT_SECRET, PORT, FRONTEND_ORIGIN, COOKIE_SECURE. No publicar contraseñas. Ejecutar `.\mvnw.cmd test` con MySQL activo. Verificación integral pendiente en el equipo del estudiante.
