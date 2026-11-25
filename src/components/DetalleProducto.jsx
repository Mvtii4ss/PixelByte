import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../services/productos.js';
import { agregarAlCarrito } from '../services/carrito.js';
import { obtenerPrecioFinal } from './Productos.jsx';

function DetalleProducto() {
    const { id } = useParams();
    const [mensaje, setMensaje] = useState('');

    const [producto,setProducto]=useState(null);
    const [error,setError]=useState('');
    useEffect(()=>{let active=true;setProducto(null);setError('');getProduct(id).then(p=>{if(active)setProducto(p);}).catch(e=>{if(active)setError(e.message);});return ()=>{active=false;};},[id]);

    if (!producto) {
        return (
            <main className="container my-5">
                <h2>{error || 'Cargando producto...'}</h2>
                <Link to="/productos" className="btn btn-primary">
                    Volver a productos
                </Link>
            </main>
        );
    }

    const precioFinal = obtenerPrecioFinal(producto);

    function handleAgregar() {
        const cantidad = agregarAlCarrito({
            ...producto,
            price: precioFinal
        });

        setMensaje(
            `¡Producto agregado al carrito! Cantidad: ${cantidad}`
        );
    }

    return (
        <main className="product-detail-wrapper">
            <Link to="/productos">← Volver a productos</Link>

            <div className="product-detail-grid mt-4">
                <div className="product-detail-img">
                    <img src={producto.img} alt={producto.name} />
                </div>

                <div className="product-detail-info">
                    <h1>{producto.name}</h1>

                    {precioFinal < producto.price && (
                        <p className="text-decoration-line-through">
                            ${producto.price.toLocaleString('es-CL')}
                        </p>
                    )}

                    <p className="product-detail-price">
                        ${precioFinal.toLocaleString('es-CL')}
                    </p>

                    <p className="product-detail-desc">
                        {producto.desc ||
                            'Producto de alta calidad diseñado para ofrecer el máximo rendimiento en tu setup.'}
                    </p>

                    {mensaje && (
                        <div className="alert alert-success" role="status">
                            {mensaje}
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleAgregar} disabled={producto.stock===0}
                    >
                        Añadir al carrito 🛒
                    </button>

                    <Link to="/carrito" className="btn btn-outline mt-3">
                        Ver carrito
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default DetalleProducto;