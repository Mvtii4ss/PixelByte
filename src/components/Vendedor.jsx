import { getProducts } from '../services/productos.js';
function Vendedor() {
    const productos = getProducts();
    let ordenes = [];
    try { ordenes = JSON.parse(localStorage.getItem('pixelbyte_orders') || '[]'); } catch { /* sin órdenes */ }
    return <main className="container my-5"><h1>Panel Vendedor</h1><p>Consulta de inventario y órdenes de compra. No puedes editar estos datos.</p>
        <section className="admin-section"><h2>Productos</h2><div className="table-responsive"><table className="admin-table"><thead><tr><th>Código</th><th>Nombre</th><th>Precio</th><th>Stock</th></tr></thead>
            <tbody>{productos.map(p=><tr key={p.id}><td>{p.code || p.id}</td><td>{p.name}</td><td>${p.price.toLocaleString('es-CL')}</td><td>{p.stock ?? 'N/D'}</td></tr>)}</tbody></table></div></section>
        <section className="admin-section"><h2>Órdenes de prueba</h2>{ordenes.length === 0 && <p>No hay órdenes registradas.</p>}
            <div className="table-responsive"><table className="admin-table"><thead><tr><th>Número</th><th>Cliente</th><th>Productos</th><th>Total</th></tr></thead>
                <tbody>{ordenes.map(o=><tr key={o.id}><td>{o.id}</td><td>{o.cliente?.nombre}</td><td>{o.items.map(p=>`${p.name} (${p.quantity})`).join(', ')}</td><td>${o.total.toLocaleString('es-CL')}</td></tr>)}</tbody></table></div>
        </section>
    </main>;
}
export default Vendedor;
