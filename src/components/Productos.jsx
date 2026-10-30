import { useState, useEffect} from "react";
import { getProducts } from "../services/productos";
import { agregarAlCarrito } from '../services/carrito.js';
import { Link } from 'react-router-dom';

// Ofertas de demostración: ID del producto y porcentaje de descuento
const descuentos = {
    'PROD-01': 15,
    'PROD-05': 10,
    'PROD-08': 20
};

function obtenerCategoria(producto) {
    if (producto.category) return producto.category;

    const nombre = producto.name.toLowerCase();

    if (nombre.includes('notebook')) return 'Computadores';
    if (nombre.includes('monitor')) return 'Monitores';

    if (/teclado|mouse|audífono|micrófono|control/.test(nombre)) {
        return 'Periféricos';
    }

    if (/tarjeta|procesador|memoria|gabinete/.test(nombre)) {
        return 'Componentes';
    }

    return 'Otros';
}

export function obtenerPrecioFinal(producto) {
    const descuento = descuentos[producto.id] || 0;

    return Math.round(producto.price * (1 - descuento / 100));
}



function Productos({ vista = 'productos' }){
    const [productos, setProductos] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const [categoria, setCategoria] = useState('Todas');

    useEffect(() => {
        setProductos(getProducts());
    }, []);

    const categorias = [
        'Todas',
        ...new Set(productos.map(obtenerCategoria))
    ];

    const productosFiltrados = productos.filter(producto => {
        if (vista === 'ofertas') {
            return descuentos[producto.id] > 0;
        }

        if (vista === 'categorias' && categoria !== 'Todas') {
            return obtenerCategoria(producto) === categoria;
        }

        return true;
    });
    

    function handleAgregar(producto) {
        const productoFinal = {
            ...producto,
            price: obtenerPrecioFinal(producto)
        };

        const cantidad = agregarAlCarrito(productoFinal);

        setMensaje(
            `¡${producto.name} agregado al carrito! Cantidad: ${cantidad}`
        );
    }

    return (
        <main className="container my-5">  

            <h1 className="section-title">
                {vista === 'categorias'
                ? 'Categorías'
                : vista === 'ofertas'
                ? 'Ofertas especiales'
                : 'Nuestros productos'}
            </h1>

            {vista === 'categorias' && (
                <div className="mb-4">
                    <label className="form-label">
                        Seleccionar categoría
                    </label>

                    <select
                        className="form-select"
                        value={categoria}
                        onChange={e => setCategoria(e.target.value)}
                    >
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {mensaje && (
                <div className="alert alert-success" role="status">
                    {mensaje}
                    <button
                        type="button"
                        className="btn-close float-end"
                        onClick={() => setMensaje('')}
                        aria-label="Cerrar"
                    />
                </div>
            )}

            {productosFiltrados.length === 0 && <p>No hay productos disponibles en esta selección.</p>}
            <div className="products-grid">
                {productosFiltrados.map(producto => (
                    <div className="product-card" key={producto.id}>
                        <Link
                            to={`/producto/${producto.id}`}
                            className="product-card-link"
                        >
                            <img
                                src={producto.img}
                                alt={producto.name}
                            />
                        
                            <h3>{producto.name}</h3>
                        </Link>

                            {descuentos[producto.id] > 0 && (
                                <span className="badge bg-danger mb-2">
                                    -{descuentos[producto.id]}% OFF
                                </span>
                            )}

                            {descuentos[producto.id] > 0 && (
                                <p className="text-decoration-line-through text-secondary mb-1">
                                    ${producto.price.toLocaleString('es-CL')}
                                </p>
                            )}

                            <p className="product-price">
                                ${obtenerPrecioFinal(producto).toLocaleString('es-CL')}
                            </p>

                        <button
                            className="btn btn-primary"
                            onClick={() => handleAgregar(producto)}
                        >
                            Añadir al carrito
                        </button>
                    </div>
                ))}
            </div>
    </main>
    );
}

export default Productos;