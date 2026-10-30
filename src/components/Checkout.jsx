import { useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerCarrito, vaciarCarrito } from '../services/carrito.js';
import { obtenerSesion } from '../services/sesion.js';
import { obtenerUsuarios } from '../services/usuarios.js';

const regiones = {
    'Región Metropolitana de Santiago': ['Santiago', 'Providencia', 'Las Condes', 'La Florida', 'Maipú', 'Puente Alto', 'Ñuñoa'],
    'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana'],
    'Región del Biobío': ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Los Ángeles']
};
const dinero = valor => `$${Number(valor).toLocaleString('es-CL')}`;

function Checkout() {
    const [carrito] = useState(obtenerCarrito);
    const [resultado, setResultado] = useState('');
    const [orden, setOrden] = useState(null);
    const [simulacion, setSimulacion] = useState('aprobado');
    const [error, setError] = useState('');
    const [datos, setDatos] = useState(() => {
        const sesion = obtenerSesion();
        const persona = obtenerUsuarios().find(u => u.email === sesion?.email);
        return { nombre: [persona?.nombre || sesion?.nombre, persona?.apellidos].filter(Boolean).join(' '),
            email: persona?.email || sesion?.email || '', region: persona?.region || '',
            comuna: persona?.comuna || '', direccion: persona?.direccion || '', indicaciones: '', envio: 'estandar' };
    });
    const total = carrito.reduce((suma, item) => suma + item.price * item.quantity, 0);
    function actualizar(evento) {
        const { name, value } = evento.target;
        setDatos(anterior => ({ ...anterior, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }));
        setError('');
    }
    function procesarPago(evento) {
        evento.preventDefault();
        if (!datos.nombre.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email) || !datos.direccion.trim() ||
            !regiones[datos.region]?.includes(datos.comuna)) {
            setError('Completa correctamente los datos de contacto, región, comuna y dirección de entrega.');
            return;
        }
        if (simulacion === 'rechazado') { setResultado('rechazado'); return; }
        const nuevaOrden = { id: `PB-${Date.now()}`, fecha: new Date().toLocaleString('es-CL'),
            cliente: { ...datos }, items: carrito.map(p => ({ ...p })), total, estado: 'Aprobado (simulación)' };
        let ordenes = [];
        try { ordenes = JSON.parse(localStorage.getItem('pixelbyte_orders') || '[]'); } catch { /* datos anteriores dañados */ }
        localStorage.setItem('pixelbyte_orders', JSON.stringify([...ordenes, nuevaOrden]));
        setOrden(nuevaOrden); vaciarCarrito(); setResultado('aprobado');
    }
    if (resultado === 'aprobado' && orden) {
        return <main className="container my-5 checkout-page">
            <div className="alert alert-success" role="status"><h2>¡Compra de prueba aprobada!</h2>La transacción fue simulada; no se ha realizado ningún cobro.</div>
            <section className="admin-section"><h3>Comprobante de compra</h3>
                <p><strong>Número de orden:</strong> {orden.id}</p><p><strong>Fecha:</strong> {orden.fecha}</p>
                <p><strong>Cliente:</strong> {orden.cliente.nombre} ({orden.cliente.email})</p>
                <p><strong>Entrega:</strong> {orden.cliente.direccion}, {orden.cliente.comuna}, {orden.cliente.region}</p>
                <ul>{orden.items.map(item => <li key={item.id}>{item.name} × {item.quantity} — {dinero(item.price * item.quantity)}</li>)}</ul>
                <h3>Total: {dinero(orden.total)}</h3>
            </section><Link className="btn btn-primary" to="/">Volver a la tienda</Link>
        </main>;
    }
    if (carrito.length === 0) {
        return <main className="container my-5"><h2>No hay productos para pagar</h2><Link className="btn btn-primary" to="/productos">Ver productos</Link></main>;
    }
    return <main className="container my-5 checkout-page">
        <h1>Finalizar compra</h1><p>Pago y despacho de demostración (sin transacciones reales).</p>
        <div className="row g-4">
            <div className="col-lg-7"><section className="admin-section"><h2>Datos de entrega</h2>
                <form onSubmit={procesarPago} noValidate>
                    {[['nombre','Nombre completo','text'],['email','Correo electrónico','email'],['direccion','Dirección de entrega','text']].map(([campo,label,tipo]) =>
                        <div className="mb-3" key={campo}><label className="form-label" htmlFor={'checkout-'+campo}>{label}</label>
                            <input id={'checkout-'+campo} className="form-control" name={campo} type={tipo} value={datos[campo]} onChange={actualizar} required/></div>)}
                    <div className="row g-3 mb-3"><div className="col-md-6"><label className="form-label" htmlFor="checkout-region">Región</label>
                        <select id="checkout-region" className="form-select" name="region" value={datos.region} onChange={actualizar} required><option value="">Selecciona región</option>{Object.keys(regiones).map(r=><option key={r}>{r}</option>)}</select></div>
                        <div className="col-md-6"><label className="form-label" htmlFor="checkout-comuna">Comuna</label><select id="checkout-comuna" className="form-select" name="comuna" value={datos.comuna} onChange={actualizar} required disabled={!datos.region}><option value="">Selecciona comuna</option>{(regiones[datos.region]||[]).map(c=><option key={c}>{c}</option>)}</select></div></div>
                    <div className="mb-3"><label className="form-label" htmlFor="checkout-indicaciones">Indicaciones de entrega (opcional)</label><textarea id="checkout-indicaciones" className="form-control" name="indicaciones" rows="2" maxLength="300" value={datos.indicaciones} onChange={actualizar}/></div>
                    <div className="mb-3"><label className="form-label" htmlFor="checkout-envio">Tipo de entrega</label><select id="checkout-envio" className="form-select" name="envio" value={datos.envio} onChange={actualizar}><option value="estandar">Despacho estándar (simulado, sin costo)</option><option value="retiro">Retiro en tienda (simulado)</option></select></div>
                    <div className="mb-3"><label className="form-label" htmlFor="checkout-resultado">Resultado del pago de prueba</label><select id="checkout-resultado" className="form-select" value={simulacion} onChange={e=>{setSimulacion(e.target.value);setResultado('');}}><option value="aprobado">Pago aprobado</option><option value="rechazado">Pago rechazado</option></select></div>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {resultado === 'rechazado' && <div className="alert alert-danger" role="alert"><strong>Pago rechazado.</strong> La simulación no generó una orden ni vació el carrito. Puedes volver a intentar.</div>}
                    <button type="submit" className="btn btn-primary">Confirmar pago de prueba</button>
                </form>
            </section></div>
            <div className="col-lg-5"><aside className="admin-section"><h2>Resumen de compra</h2>
                {carrito.map(item=><div className="d-flex justify-content-between gap-3 mb-2" key={item.id}><span>{item.name} × {item.quantity}</span><strong>{dinero(item.price*item.quantity)}</strong></div>)}
                <hr/><div className="d-flex justify-content-between"><strong>Total</strong><strong className="text-success">{dinero(total)}</strong></div>
            </aside></div>
        </div>
    </main>;
}
export default Checkout;
