import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { validarRun, validarCampoRegistro, validarRegistro } from './services/validacionesRegistro.js';
import { getProducts, haciaApi, desdeApi, featuredProducts } from './services/productos.js';
import { obtenerCarrito, agregarAlCarrito, cambiarCantidad, eliminarDelCarrito, vaciarCarrito } from './services/carrito.js';
import { autenticar, salir } from './services/api.js';
import Navbar from './components/Navbar.jsx';
import Productos from './components/Productos.jsx';
import Checkout from './components/Checkout.jsx';

const mockFetch=(fn)=>vi.stubGlobal('fetch',vi.fn(async (url,opts)=>{const data=await fn(url,opts);return {ok:true,status:200,text:async()=>JSON.stringify(data)};}));
const demoUser=role=>({id:'u1',email:'test@gmail.com',nombre:'Prueba',role});
async function session(role){mockFetch(()=>({accessToken:'test-token',usuario:demoUser(role)}));await autenticar('login',{});}
beforeEach(() => { localStorage.clear(); });
afterEach(async () => { cleanup();mockFetch(()=>null);await salir();vi.unstubAllGlobals();vi.restoreAllMocks(); });

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
    it('07. Productos: GET adapta los campos de la API', async () => {
        mockFetch(()=>featuredProducts.map(p=>haciaApi({...p,stock:20,category:'Componentes'})));
        const lista=await getProducts();expect(lista).toHaveLength(featuredProducts.length);expect(lista[0].name).toBe(featuredProducts[0].name);expect(localStorage.getItem('pixelbyte_products')).toBeNull();
    });
    it('08. Productos: transforma el DTO de ida y vuelta', () => {
        const p={id:'X1',name:'Producto nuevo',price:0,img:'',stock:2,category:'Otros',desc:'',stockCritico:null};expect(desdeApi(haciaApi(p))).toMatchObject(p);
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
    it('11. Navbar: muestra Admin únicamente para el rol autorizado', async () => {
        await session('Administrador');
        const vista = render(<MemoryRouter><Navbar /></MemoryRouter>);
        expect(screen.getByRole('link', {name:/Admin/})).toBeTruthy();
        vista.unmount();
        await session('Cliente');
        render(<MemoryRouter><Navbar /></MemoryRouter>);
        expect(screen.queryByRole('link', {name:/Admin/})).toBeNull();
    });
    it('12. Productos: renderiza tarjetas y permite agregar con un clic', async () => {
        mockFetch(()=>featuredProducts.map(p=>haciaApi({...p,stock:20,category:'Componentes'})));
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
    it('14. Checkout: aprobación genera orden con detalle y vacía carrito', async () => {
        await session('Cliente');
        mockFetch((url,opts)=>{expect(url).toContain('/ordenes');expect(opts.headers.Authorization).toBe('Bearer test-token');const body=JSON.parse(opts.body);expect(body.items[0].id).toBe('PROD-01');return {id:'PB-TEST',fecha:'2026-11-24',cliente:body.cliente,items:[{...featuredProducts[0],quantity:1}],total:650000};});
        agregarAlCarrito(featuredProducts[0]);
        render(<MemoryRouter><Checkout /></MemoryRouter>);
        fireEvent.change(screen.getByLabelText('Nombre completo'), {target:{value:'Comprador de prueba'}});
        fireEvent.change(screen.getByLabelText('Correo electrónico'), {target:{value:'cliente@gmail.com'}});
        fireEvent.change(screen.getByLabelText('Dirección de entrega'), {target:{value:'Calle de ejemplo 123'}});
        fireEvent.change(screen.getByLabelText('Región'), {target:{value:'Región Metropolitana de Santiago'}});
        fireEvent.change(screen.getByLabelText('Comuna'), {target:{value:'La Florida'}});
        fireEvent.click(screen.getByRole('button', {name:'Confirmar pago de prueba'}));
        await waitFor(()=>expect(screen.getByRole('status').textContent).toContain('Compra de prueba aprobada'));
        expect(localStorage.getItem('pixelbyte_orders')).toBeNull();
        expect(obtenerCarrito()).toEqual([]);
    });
});
