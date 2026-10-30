# PixelByte — Evaluación 2 | Fullstack II

Tienda online simulada de hardware y periféricos gaming, migrada desde HTML/CSS/JavaScript a **React 19 + React Router + Bootstrap 5 + Vite**. Conserva los servicios JavaScript y el estilo original. Los datos se guardan únicamente en **localStorage**.

## Ejecutar en Windows (VS Code / PowerShell)

1. Abrir esta carpeta (la que tiene `package.json`).
2. Instalar las dependencias: `npm.cmd install`
3. Ejecutar Vite: `npm.cmd run dev`
4. Abrir la dirección que muestra `Local` (por ejemplo, `http://localhost:5173/`).

### Verificaciones

- Compilar para producción: `npm.cmd run build`
- Ejecutar las pruebas automáticas Vitest: `npm.cmd run test:run`
- Ejecutar pruebas interactivamente: `npm.cmd run test`

**Para la Evaluación 2 se utiliza Vitest**, siguiendo la instrucción actualizada del docente (aunque los PDF anteriores mencionan Jasmine/Karma). Los casos están en `src/pixelbyte.test.jsx` y usan jsdom y React Testing Library.

## Páginas y rutas

Tienda: `#/`, `#/productos`, `#/producto/PROD-01`, `#/categorias`, `#/ofertas`, `#/carrito`, `#/checkout`, `#/contacto`, `#/noticias`, `#/noticias/1`, `#/noticias/2`, `#/nosotros`, `#/login`, `#/registro`.

Admin: `#/admin` (protegida por rol, navegación lateral Inicio / Productos / Usuarios / Mensajes / Órdenes). Vendedor: `#/vendedor` (productos y órdenes en modo consulta).

### Cuentas de ejemplo (solo pruebas)

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@duoc.cl` | `123456` |
| Vendedor | `vendedor@profesor.duoc.cl` | `123456` |
| Cliente | `cliente@gmail.com` | `123456` |

Los datos de ejemplo se generan al usar el login por primera vez si no se han almacenado usuarios.

## Datos locales

- `pixelbyte_products`: catálogo editable desde Admin.
- `pixelbyte_users`: usuarios de prueba.
- `pixelbyte_active_user`: sesión simulada.
- `pixelbyte_cart`: carrito de compras.
- `pixelbyte_messages`: mensajes del formulario de contacto.
- `pixelbyte_orders`: órdenes **aprobadas** por el simulador de checkout.

No borrar el almacenamiento si deseas mantener datos ya ingresados. Los puertos diferentes (`5173`/`5190`) mantienen almacenamientos separados por origen.

## Límites de la versión académica

No existe pasarela de pago ni backend. Se simulan aprobación y rechazo sin cargos bancarios. Usuarios, credenciales y permisos en `localStorage` **no son seguros para producción**. Las ofertas son descuentos de demostración y no gestionan promociones externas.

## Estructura

- `src/App.jsx`: rutas y protección del panel administrativo.
- `src/components/`: vistas React.
- `src/services/`: servicios JavaScript originales de productos, usuarios, sesión y carrito y validador de registro.
- `src/estilos.css`: diseño original con ajustes responsivos.
- `src/pixelbyte.test.jsx`: casos de prueba unitarios Vitest.

Los HTML de Evaluación 1 incluidos como referencia no participan en la navegación React. La aplicación que debe abrirse es `index.html` a través de Vite.
