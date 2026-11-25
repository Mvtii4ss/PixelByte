import {useState,useEffect} from 'react';
import {api} from '../services/api.js';
import {Link} from 'react-router-dom';
import { getProducts } from '../services/productos.js';
function Vendedor() {
    const [productos,setProductos]=useState([]),[ordenes,setOrdenes]=useState([]),[error,setError]=useState('');
    useEffect(()=>{Promise.all([getProducts(),api('/ordenes',{auth:true})]).then(([p,o])=>{setProductos(p);setOrdenes(o);}).catch(e=>setError(e.message));},[]);
    return <main className="container my-5"><h1>Panel Vendedor</h1><p>Consulta de inventario y órdenes de compra. No puedes editar estos datos.</p>
        {error&&<div className="alert alert-danger">{error}</div>}<section className="admin-section"><h2>Productos</h2><div className="table-responsive"><table className="admin-table"><thead><tr><th>Código</th><th>Nombre</th><th>Precio</th><th>Stock</th></tr></thead>
            <tbody>{productos.map(p=><tr key={p.id}><td>{p.code || p.id}</td><td><Link to={`/producto/${p.id}`}>{p.name}</Link></td><td>${p.price.toLocaleString('es-CL')}</td><td>{p.stock ?? 'N/D'}</td></tr>)}</tbody></table></div></section>
        <section className="admin-section"><h2>Órdenes registradas</h2>{ordenes.length === 0 && <p>No hay órdenes registradas.</p>}
            <div className="table-responsive"><table className="admin-table"><thead><tr><th>Número</th><th>Cliente</th><th>Productos</th><th>Total</th></tr></thead>
                <tbody>{ordenes.map(o=><tr key={o.id}><td><details><summary>{o.id}</summary><p>Fecha: {o.fecha}</p><p>Estado: {o.estado}</p><p>Entrega: {o.cliente?.direccion}, {o.cliente?.comuna}</p></details></td><td>{o.cliente?.nombre}</td><td>{o.items.map(p=>`${p.name} (${p.quantity})`).join(', ')}</td><td>${o.total.toLocaleString('es-CL')}</td></tr>)}</tbody></table></div>
        </section>
    </main>;
}
export default Vendedor;
