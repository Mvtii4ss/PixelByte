import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, guardarProductos } from '../services/productos.js';
import { obtenerUsuarios, guardarUsuarios } from '../services/usuarios.js';
import { obtenerSesion, cerrarSesion } from '../services/sesion.js';
import { validarRegistro } from '../services/validacionesRegistro.js';

const categorias = ['Tarjetas de Video', 'Periféricos', 'Audio', 'Almacenamiento', 'Componentes', 'Monitores', 'Computadores', 'Otros'];
const regiones = {
    'Región Metropolitana de Santiago': ['Santiago', 'Providencia', 'Las Condes', 'La Florida', 'Maipú', 'Puente Alto', 'Ñuñoa'],
    'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana'],
    'Región del Biobío': ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Los Ángeles']
};
const productoVacio = { code: '', name: '', desc: '', price: '', stock: '', stockCritico: '', category: 'Tarjetas de Video', img: '' };
const usuarioVacio = { run: '', nombre: '', apellidos: '', email: '', confirmarEmail: '', password: '', confirmarPassword: '', fechaNac: '', role: 'Cliente', region: '', comuna: '', direccion: '' };
const leer = (clave) => { try { return JSON.parse(localStorage.getItem(clave) || '[]'); } catch { return []; } };
const dinero = (n) => `$${Number(n || 0).toLocaleString('es-CL')}`;

function Admin() {
    const navigate = useNavigate();
    const [pestana, setPestana] = useState('resumen');
    const [productos, setProductos] = useState(getProducts);
    const [usuarios, setUsuarios] = useState(obtenerUsuarios);
    const [mensajes, setMensajes] = useState(() => leer('pixelbyte_messages'));
    const [ordenes, setOrdenes] = useState(() => leer('pixelbyte_orders'));
    const [formulario, setFormulario] = useState(productoVacio);
    const [editando, setEditando] = useState(null);
    const [usuarioForm, setUsuarioForm] = useState(usuarioVacio);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [error, setError] = useState('');

    function seleccionar(tab) { setPestana(tab); setError(''); }
    function actualizarCampo(e) { setFormulario(actual => ({ ...actual, [e.target.name]: e.target.value })); }
    function actualizarUsuario(e) {
        const { name, value } = e.target;
        setUsuarioForm(actual => ({ ...actual, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }));
    }
    function cancelarProducto() { setFormulario(productoVacio); setEditando(null); setError(''); }
    function guardar(evento) {
        evento.preventDefault();
        if (formulario.code.trim().length < 3 || !formulario.name.trim() || formulario.name.length > 100 || formulario.desc.length > 500 ||
            formulario.price === '' || Number(formulario.price) < 0 || formulario.stock === '' || !Number.isInteger(Number(formulario.stock)) || Number(formulario.stock) < 0 ||
            (formulario.stockCritico !== '' && (!Number.isInteger(Number(formulario.stockCritico)) || Number(formulario.stockCritico) < 0))) {
            setError('Revisa el código (mínimo 3), nombre, descripción, precio y cantidades de stock.');
            return;
        }
        const producto = {
            ...formulario, id: editando ?? Date.now().toString(),
            code: formulario.code.trim(), name: formulario.name.trim(), desc: formulario.desc.trim(),
            price: Number(formulario.price), stock: Number(formulario.stock),
            stockCritico: formulario.stockCritico === '' ? null : Number(formulario.stockCritico),
            img: formulario.img.trim() || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80'
        };
        const actualizados = editando === null ? [...productos, producto] : productos.map(p => String(p.id) === String(editando) ? producto : p);
        guardarProductos(actualizados); setProductos(actualizados); cancelarProducto();
    }
    function editar(producto) {
        setFormulario({ ...productoVacio, ...producto, code: producto.code || producto.id, stockCritico: producto.stockCritico ?? '' });
        setEditando(producto.id); setError('');
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
    }
    function eliminar(id) {
        if (!window.confirm('¿Eliminar este producto?')) return;
        const actualizados = productos.filter(p => String(p.id) !== String(id));
        guardarProductos(actualizados); setProductos(actualizados); cancelarProducto();
    }
    function cancelarUsuario() { setUsuarioForm(usuarioVacio); setUsuarioEditando(null); setError(''); }
    function editarUsuario(usuario) {
        setUsuarioEditando(usuario.email);
        setUsuarioForm({ ...usuarioVacio, ...usuario, confirmarEmail: usuario.email, password: '', confirmarPassword: '' });
        setError('');
    }
    function guardarUsuario(e) {
        e.preventDefault();
        const email = usuarioForm.email.trim().toLowerCase();
        const emailDuplicado = usuarios.filter(u => u.email.toLowerCase() !== String(usuarioEditando).toLowerCase());
        const datosValidar = { ...usuarioForm, email, confirmarEmail: usuarioForm.confirmarEmail.trim().toLowerCase() };
        // Al editar, una contraseña en blanco conserva la existente y no obliga a volver a ingresarla.
        const usuarioAnterior = usuarios.find(u => u.email === usuarioEditando);
        if (usuarioEditando && !usuarioForm.password) {
            datosValidar.password = usuarioAnterior?.password || '';
            datosValidar.confirmarPassword = datosValidar.password;
        }
        const errores = validarRegistro(datosValidar, emailDuplicado);
        if (Object.keys(errores).length) { setError(Object.values(errores)[0]); return; }
        if (!regiones[usuarioForm.region]?.includes(usuarioForm.comuna)) { setError('Selecciona una comuna de la región indicada.'); return; }
        if (emailDuplicado.some(u => u.run && u.run.toUpperCase() === usuarioForm.run.toUpperCase())) { setError('Este RUN ya se encuentra registrado.'); return; }
        const nuevo = { ...datosValidar, run: usuarioForm.run.trim().toUpperCase(), nombre: usuarioForm.nombre.trim(), apellidos: usuarioForm.apellidos.trim(),
            password: datosValidar.password, direccion: usuarioForm.direccion.trim(), role: usuarioForm.role };
        delete nuevo.confirmarEmail; delete nuevo.confirmarPassword;
        const actualizados = usuarioEditando ? usuarios.map(u => u.email === usuarioEditando ? nuevo : u) : [...usuarios, nuevo];
        guardarUsuarios(actualizados); setUsuarios(actualizados); cancelarUsuario();
    }
    function eliminarUsuario(email) {
        if (email === obtenerSesion()?.email) { setError('No puedes eliminar tu propia cuenta mientras mantienes una sesión activa.'); return; }
        if (!window.confirm('¿Eliminar este usuario?')) return;
        const actualizados = usuarios.filter(u => u.email !== email);
        guardarUsuarios(actualizados); setUsuarios(actualizados); cancelarUsuario();
    }
    function eliminarMensaje(id, indice) {
        if (!window.confirm('¿Eliminar este mensaje?')) return;
        const actualizados = mensajes.filter((m, i) => id !== undefined ? String(m.id) !== String(id) : i !== indice);
        localStorage.setItem('pixelbyte_messages', JSON.stringify(actualizados)); setMensajes(actualizados);
    }
    const stockBajo = productos.filter(p => p.stock != null && p.stockCritico != null && p.stock !== '' && Number(p.stock) <= Number(p.stockCritico));
    return (
        <main className="admin-layout">
            <aside className="admin-sidebar" aria-label="Panel de administración">
                <h2>Admin Panel</h2>
                <nav className="admin-menu" aria-label="Secciones del administrador">
                    {[['resumen','Inicio'],['productos','Productos'],['usuarios','Usuarios'],['mensajes','Mensajes'],['ordenes','Órdenes']].map(([id, nombre]) => (
                        <button key={id} type="button" className={`menu-btn ${pestana === id ? 'active' : ''}`} onClick={() => seleccionar(id)}>{nombre}</button>
                    ))}
                </nav>
                <button type="button" className="btn btn-outline btn-logout" onClick={() => { cerrarSesion(); navigate('/'); }}>Cerrar sesión</button>
            </aside>
            <div className="admin-content">
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                {pestana === 'resumen' && <section className="admin-section">
                    <h1>Hola, Administrador</h1>
                    <p>Gestiona el catálogo, los usuarios, los mensajes y las órdenes desde el menú lateral.</p>
                    <div className="row g-3 mt-3">
                        {[['Productos',productos.length],['Usuarios',usuarios.length],['Mensajes',mensajes.length],['Órdenes',ordenes.length]].map(([t,n]) =>
                            <div className="col-6 col-lg-3" key={t}><div className="stat-panel"><strong>{n}</strong><span>{t}</span></div></div>)}
                    </div>
                    {stockBajo.length > 0 && <div className="alert alert-warning mt-4" role="status">Stock crítico: {stockBajo.map(p=>p.name).join(', ')}</div>}
                </section>}
                {pestana === 'productos' && <section aria-label="Mantenedor de productos">
                    <h1>Mantenedor de Productos</h1>
                    <div className="admin-section">
                        <h2>{editando !== null ? 'Editar producto' : 'Agregar nuevo producto'}</h2>
                        <form className="admin-form" onSubmit={guardar}>
                            <div className="row g-3">
                                {[
                                    ['code','Código del producto (mín. 3)','text',true],['name','Nombre (máx. 100)','text',true],
                                    ['price','Precio ($; admite 0)','number',true],['stock','Stock','number',true],['stockCritico','Stock crítico (opcional)','number',false],
                                    ['img','URL de imagen (opcional)','url',false]
                                ].map(([name,label,type,required]) => <div className="col-md-6" key={name}>
                                    <label className="form-label" htmlFor={'prod-'+name}>{label}</label>
                                    <input id={'prod-'+name} className="form-control" name={name} type={type} value={formulario[name] ?? ''}
                                        onChange={actualizarCampo} required={required} min={type === 'number' ? 0 : undefined} step={name === 'price' ? '0.01' : type === 'number' ? '1' : undefined}
                                        maxLength={name === 'name' ? 100 : undefined}/>
                                </div>)}
                                <div className="col-md-6"><label className="form-label" htmlFor="prod-category">Categoría</label>
                                    <select id="prod-category" className="form-select" name="category" value={formulario.category} onChange={actualizarCampo}>{categorias.map(c => <option key={c}>{c}</option>)}</select>
                                </div>
                                <div className="col-12"><label className="form-label" htmlFor="prod-desc">Descripción (máx. 500)</label>
                                    <textarea id="prod-desc" className="form-control" name="desc" maxLength="500" rows="2" value={formulario.desc} onChange={actualizarCampo}/></div>
                            </div>
                            <div className="admin-form-actions"><button className="btn btn-primary" type="submit">{editando !== null ? 'Guardar cambios' : 'Guardar producto'}</button>
                                {editando !== null && <button type="button" className="btn btn-outline" onClick={cancelarProducto}>Cancelar</button>}</div>
                        </form>
                    </div>
                    <div className="admin-section"><h2>Inventario de productos ({productos.length})</h2>
                        <div className="table-responsive"><table className="admin-table"><thead><tr><th>Imagen</th><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
                        <tbody>{productos.map(p => <tr key={p.id}><td><img className="admin-prod-img" src={p.img} alt="" /></td><td>{p.code || p.id}</td><td>{p.name}</td><td>{p.category || 'Sin categoría'}</td><td>{dinero(p.price)}</td>
                            <td>{p.stock ?? 'N/D'}{p.stock != null && p.stockCritico != null && Number(p.stock) <= Number(p.stockCritico) && <span className="badge bg-warning text-dark ms-2">Crítico</span>}</td>
                            <td><button className="btn btn-warning btn-sm me-2" type="button" onClick={()=>editar(p)}>Editar</button><button className="btn btn-danger btn-sm" type="button" onClick={()=>eliminar(p.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
                    </div>
                </section>}
                {pestana === 'usuarios' && <section aria-label="Mantenedor de usuarios">
                    <h1>Mantenedor de Usuarios</h1>
                    <div className="admin-section"><h2>{usuarioEditando ? 'Editar usuario' : 'Agregar nuevo usuario'}</h2>
                        <form onSubmit={guardarUsuario} className="admin-form" noValidate>
                            <div className="row g-3">
                                {[
                                    ['run','RUN sin puntos ni guion','text'],['nombre','Nombre','text'],['apellidos','Apellidos','text'],
                                    ['email','Correo electrónico','email'],['confirmarEmail','Confirmar correo','email'],
                                    ['password',usuarioEditando ? 'Nueva contraseña (opcional)' : 'Contraseña (4 a 10 caracteres)','password'],
                                    ['confirmarPassword','Confirmar contraseña','password'],['fechaNac','Fecha de nacimiento (opcional)','date'],['direccion','Dirección','text']
                                ].map(([name,label,type]) => <div className="col-md-6" key={name}>
                                    <label className="form-label" htmlFor={'usr-'+name}>{label}</label>
                                    <input id={'usr-'+name} className="form-control" type={type} name={name} value={usuarioForm[name] || ''} onChange={actualizarUsuario}
                                        maxLength={name === 'run' ? 9 : name === 'password' || name === 'confirmarPassword' ? 10 : name === 'nombre' ? 50 : name === 'direccion' ? 300 : 100}/>
                                </div>)}
                                <div className="col-md-4"><label className="form-label" htmlFor="usr-role">Rol</label><select id="usr-role" className="form-select" name="role" value={usuarioForm.role} onChange={actualizarUsuario}><option>Cliente</option><option>Vendedor</option><option>Administrador</option></select></div>
                                <div className="col-md-4"><label className="form-label" htmlFor="usr-region">Región</label><select id="usr-region" className="form-select" name="region" value={usuarioForm.region} onChange={actualizarUsuario}><option value="">Seleccionar región</option>{Object.keys(regiones).map(r=><option key={r}>{r}</option>)}</select></div>
                                <div className="col-md-4"><label className="form-label" htmlFor="usr-comuna">Comuna</label><select id="usr-comuna" className="form-select" name="comuna" value={usuarioForm.comuna} onChange={actualizarUsuario} disabled={!usuarioForm.region}><option value="">Seleccionar comuna</option>{(regiones[usuarioForm.region] || []).map(c=><option key={c}>{c}</option>)}</select></div>
                            </div>
                            <div className="admin-form-actions"><button className="btn btn-primary" type="submit">{usuarioEditando ? 'Guardar cambios' : 'Guardar usuario'}</button>{usuarioEditando && <button type="button" className="btn btn-outline" onClick={cancelarUsuario}>Cancelar</button>}</div>
                        </form>
                    </div>
                    <div className="admin-section"><h2>Usuarios registrados ({usuarios.length})</h2>
                        <div className="table-responsive"><table className="admin-table"><thead><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Ubicación</th><th>Acciones</th></tr></thead>
                            <tbody>{usuarios.map(u => <tr key={u.email}><td>{u.run || '—'}</td><td>{[u.nombre,u.apellidos].filter(Boolean).join(' ')}</td><td>{u.email}</td><td>{u.role}</td><td>{[u.comuna,u.region].filter(Boolean).join(', ') || '—'}</td>
                                <td><button type="button" className="btn btn-warning btn-sm me-2" onClick={()=>editarUsuario(u)}>Editar</button>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={()=>eliminarUsuario(u.email)} disabled={u.email === obtenerSesion()?.email}>Eliminar</button></td></tr>)}</tbody></table></div>
                    </div>
                </section>}
                {pestana === 'mensajes' && <section className="admin-section"><h1>Mensajes recibidos ({mensajes.length})</h1>
                    {mensajes.length === 0 && <p>No hay mensajes recibidos.</p>}
                    <div className="messages-grid">{mensajes.map((m,i)=><div className="message-card" key={m.id ?? i}>
                        <div className="message-header"><strong>{m.nombre || m.name || 'Sin nombre'} ({m.email || 'Sin correo'})</strong><span>{m.fecha || ''}</span></div>
                        <p>{m.motivo || m.mensaje || m.msg || 'Sin contenido'}</p>
                        <button type="button" className="btn btn-danger btn-sm" onClick={()=>eliminarMensaje(m.id,i)}>Eliminar mensaje</button>
                    </div>)}</div>
                </section>}
                {pestana === 'ordenes' && <section className="admin-section"><h1>Órdenes simuladas ({ordenes.length})</h1>
                    {ordenes.length === 0 && <p>Aún no hay compras aprobadas.</p>}
                    <div className="table-responsive"><table className="admin-table"><thead><tr><th>N° orden</th><th>Cliente</th><th>Fecha</th><th>Productos</th><th>Total</th></tr></thead>
                    <tbody>{ordenes.map(o=><tr key={o.id}><td>{o.id}</td><td>{o.cliente?.nombre || o.cliente?.email || 'Cliente'}</td><td>{o.fecha}</td><td>{o.items?.map(p=>`${p.name} × ${p.quantity}`).join(', ')}</td><td>{dinero(o.total)}</td></tr>)}</tbody></table></div>
                </section>}
            </div>
        </main>
    );
}
export default Admin;
