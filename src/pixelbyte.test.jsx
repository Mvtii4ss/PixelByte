import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { validarRun, validarCampoRegistro, validarRegistro } from './services/validacionesRegistro.js';
import { getProducts, guardarProductos, featuredProducts } from './services/productos.js';
import { obtenerCarrito, agregarAlCarrito, cambiarCantidad, eliminarDelCarrito, vaciarCarrito } from './services/carrito.js';
import { inicializarUsuarios, obtenerUsuarios } from './services/usuarios.js';
import { guardarSesion } from './services/sesion.js';
import Navbar from './components/Navbar.jsx';
import Productos from './components/Productos.jsx';
import Checkout from './components/Checkout.jsx';

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('PixelByte - pruebas unitarias frontend (Vitest)', () => {
    it('01. RUN: acepta un dígito verificador correcto', () => {
        expect(validarRun('123456785')).toBe(true);
    });
    it('02. RUN: rechaza formato o dígito verificador incorrecto', () => {
        expect(validarRun('12345678K')).toBe(false);
        expect(validarRun('12.345.678-5')).toBe(false);
    });
    it('03. Registro: solo permite los dominios de correo requeridos', () => {
        const datos = { email: 'usuario@dominio.com' };
        expect(validarCampoRegistro('email', datos)).toContain('Solo se permiten');
        expect(validarCampoRegistro('email', { email: 'usuario@duoc.cl' })).toBe('');
    });
    it('04. Registro: detecta correos registrados previamente', () => {
        expect(validarCampoRegistro('email', {email:'TEST@GMAIL.COM'}, [{email:'test@gmail.com'}])).toContain('registrado');
    });
    it('05. Registro: exige que las contraseñas coincidan', () => {
        expect(validarCampoRegistro('confirmarPassword', { password:'1234', confirmarPassword:'4321' })).toContain('no coinciden');
    });
    it('06. Registro: exige comuna y dirección', () => {
        const datos = { run:'123456785', nombre:'Prueba', apellidos:'Usuario', email:'prueba@gmail.com', confirmarEmail:'prueba@gmail.com', password:'1234', confirmarPassword:'1234', region:'Región Metropolitana de Santiago', comuna:'', direccion:'' };
        const errores = validarRegistro(datos);
        expect(errores.comuna).toBeTruthy();
        expect(errores.direccion).toBeTruthy();
    });
    it('07. Productos: carga el catálogo inicial cuando no hay datos guardados', () => {
        expect(getProducts()).toHaveLength(featuredProducts.length);
        expect(localStorage.getItem('pixelbyte_products')).not.toBeNull();
    });
    it('08. Productos: respeta los cambios del catálogo guardado', () => {
        const lista = [{ id:'X1', name:'Producto nuevo', price:0, img:'', stock:2 }];
        guardarProductos(lista);
        expect(getProducts()).toEqual(lista);
    });
    it('09. Carrito: agrega unidades y notifica cambios a la UI', () => {
        const escuchar = vi.fn();
        window.addEventListener('pixelbyte-carrito', escuchar);
        expect(agregarAlCarrito(featuredProducts[0])).toBe(1);
        expect(agregarAlCarrito(featuredProducts[0])).toBe(2);
        expect(obtenerCarrito()[0].quantity).toBe(2);
        expect(escuchar).toHaveBeenCalledTimes(2);
        window.removeEventListener('pixelbyte-carrito', escuchar);
    });
    it('10. Carrito: reduce cantidad, elimina y vacía correctamente', () => {
        agregarAlCarrito(featuredProducts[0]);
        agregarAlCarrito(featuredProducts[0]);
        cambiarCantidad('PROD-01', -1);
        expect(obtenerCarrito()[0].quantity).toBe(1);
        eliminarDelCarrito('PROD-01');
        expect(obtenerCarrito()).toEqual([]);
        agregarAlCarrito(featuredProducts[1]);
        vaciarCarrito();
        expect(obtenerCarrito()).toEqual([]);
    });
    it('11. Navbar: muestra Admin únicamente para el rol autorizado', () => {
        inicializarUsuarios();
        guardarSesion(obtenerUsuarios().find(u=>u.role==='Administrador'));
        const vista = render(<MemoryRouter><Navbar /></MemoryRouter>);
        expect(screen.getByRole('link', {name:/Admin/})).toBeTruthy();
        vista.unmount();
        guardarSesion(obtenerUsuarios().find(u=>u.role==='Cliente'));
        render(<MemoryRouter><Navbar /></MemoryRouter>);
        expect(screen.queryByRole('link', {name:/Admin/})).toBeNull();
    });
    it('12. Productos: renderiza tarjetas y permite agregar con un clic', async () => {
        render(<MemoryRouter><Productos /></MemoryRouter>);
        expect(await screen.findByText('Tarjeta de Video RTX 4070')).toBeTruthy();
        fireEvent.click(screen.getAllByRole('button', {name:/Añadir al carrito/i})[0]);
        expect(obtenerCarrito()).toHaveLength(1);
        expect(screen.getByRole('status').textContent).toContain('Cantidad: 1');
    });
    it('13. Checkout: rechazo conserva el carrito y no genera orden', () => {
        agregarAlCarrito(featuredProducts[0]);
        render(<MemoryRouter><Checkout /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Nombre completo'), {target:{value:'Comprador de prueba'}});
        fireEvent.change(screen.getByLabelText('Correo electrónico'), {target:{value:'cliente@gmail.com'}});
        fireEvent.change(screen.getByLabelText('Dirección de entrega'), {target:{value:'Calle de ejemplo 123'}});
        fireEvent.change(screen.getByLabelText('Región'), {target:{value:'Región Metropolitana de Santiago'}});
        fireEvent.change(screen.getByLabelText('Comuna'), {target:{value:'La Florida'}});
        fireEvent.change(screen.getByLabelText('Resultado del pago de prueba'), {target:{value:'rechazado'}});
        fireEvent.click(screen.getByRole('button', {name:'Confirmar pago de prueba'}));
        expect(screen.getByRole('alert').textContent).toContain('Pago rechazado');
        expect(obtenerCarrito()).toHaveLength(1);
        expect(localStorage.getItem('pixelbyte_orders')).toBeNull();
    });
    it('14. Checkout: aprobación genera orden con detalle y vacía carrito', () => {
        agregarAlCarrito(featuredProducts[0]);
        render(<MemoryRouter><Checkout /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Nombre completo'), {target:{value:'Comprador de prueba'}});
        fireEvent.change(screen.getByLabelText('Correo electrónico'), {target:{value:'cliente@gmail.com'}});
        fireEvent.change(screen.getByLabelText('Dirección de entrega'), {target:{value:'Calle de ejemplo 123'}});
        fireEvent.change(screen.getByLabelText('Región'), {target:{value:'Región Metropolitana de Santiago'}});
        fireEvent.change(screen.getByLabelText('Comuna'), {target:{value:'La Florida'}});
        fireEvent.click(screen.getByRole('button', {name:'Confirmar pago de prueba'}));
        expect(screen.getByRole('status').textContent).toContain('Compra de prueba aprobada');
        const ordenes = JSON.parse(localStorage.getItem('pixelbyte_orders'));
        expect(ordenes[0].items[0].id).toBe('PROD-01');
        expect(obtenerCarrito()).toEqual([]);
    });
});
