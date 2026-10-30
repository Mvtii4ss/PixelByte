import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import {
    obtenerCarrito,
    cambiarCantidad,
    eliminarDelCarrito,
    vaciarCarrito
} from '../services/carrito.js';

function Carrito() {
    const [carrito, setCarrito] = useState(obtenerCarrito);

    useEffect(() => {
        function actualizar() {
            setCarrito(obtenerCarrito());
        }

        window.addEventListener('pixelbyte-carrito', actualizar);

        return () => {
            window.removeEventListener('pixelbyte-carrito', actualizar);
        };
    }, []);

    const total = carrito.reduce(
        (suma, item) => suma + item.price * item.quantity,
        0
    );

    return (
        <main className="container my-5">
            <h2>Tu carrito de compras</h2>

            {carrito.length === 0 ? (
                <div className="my-4">
                    <p>El carrito está vacío.</p>
                    <Link to="/productos" className="btn btn-primary">
                        Ver productos
                    </Link>
                </div>
            ) : (
                <>
                    <div id="cart-items-container">
                        {carrito.map(item => (
                            <div className="cart-item" key={item.id}>
                                <img
                                    src={item.img}
                                    alt={item.name}
                                    className="cart-item-img"
                                />

                                <div className="cart-item-info">
                                    <span className="cart-item-title">
                                        {item.name}
                                    </span>
                                    <span className="cart-item-price">
                                        ${item.price.toLocaleString('es-CL')} c/u
                                    </span>
                                </div>

                                <div className="cart-item-qty">
                                    <button
                                        className="btn-qty"
                                        onClick={() => cambiarCantidad(item.id, -1)}
                                    >
                                        −
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        className="btn-qty"
                                        onClick={() => cambiarCantidad(item.id, 1)}
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="cart-item-total">
                                    ${(item.price * item.quantity).toLocaleString('es-CL')}
                                </div>

                                <button
                                    className="btn-delete"
                                    onClick={() => eliminarDelCarrito(item.id)}
                                    title="Eliminar producto"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h3>
                            Total: ${total.toLocaleString('es-CL')}
                        </h3>

                        <div className="cart-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    if (window.confirm('¿Vaciar el carrito?')) {
                                        vaciarCarrito();
                                    }
                                }}
                            >
                                Vaciar carrito
                            </button>

                            <Link to="/checkout" className="btn btn-primary">
                                Proceder al pago
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
}

export default Carrito;