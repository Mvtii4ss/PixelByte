import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { obtenerCarrito } from '../services/carrito.js';
import { obtenerSesion, cerrarSesion } from '../services/sesion.js';

function Navbar() {

    const [cantidad, setCantidad] = useState(0);
    const [usuario, setUsuario] = useState(obtenerSesion);

    useEffect(() => {

        function actualizarSesion() {
            setUsuario(obtenerSesion());
        }

        window.addEventListener('pixelbyte-sesion', actualizarSesion);
        window.addEventListener('storage', actualizarSesion);

        return () => {
            window.removeEventListener('pixelbyte-sesion', actualizarSesion);
            window.removeEventListener('storage', actualizarSesion);
        };

    }, []);

    useEffect(() => {
        function actualizarContador() {
            const carrito = obtenerCarrito();

            const total = carrito.reduce(
                (suma, producto) => suma + producto.quantity,
                0
            );

            setCantidad(total);
        }

        actualizarContador();

        window.addEventListener('pixelbyte-carrito', actualizarContador);
        window.addEventListener('storage', actualizarContador);

        return () => {
            window.removeEventListener('pixelbyte-carrito', actualizarContador);
            window.removeEventListener('storage', actualizarContador);
        };

    }, []);

    return (
        <header className="navbar d-flex flex-wrap gap-3">
            <div className="logo">
                <NavLink to="/">
                    <span>Pixel</span>Byte
                </NavLink>
            </div>

            <nav>
                <ul className="d-flex flex-wrap gap-3 mb-0">
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/productos">Productos</NavLink></li>
                    <li><NavLink to="/categorias">Categorías</NavLink></li>
                    <li><NavLink to="/ofertas">Ofertas</NavLink></li>
                    <li><NavLink to="/contacto">Contáctanos</NavLink></li>
                    <li><NavLink to="/noticias">Noticias</NavLink></li>
                    <li><NavLink to="/nosotros">Nosotros</NavLink></li>
                </ul>
            </nav>

            <div className="header-actions">
                <NavLink to="/carrito" className="cart-btn">
                    Carrito ({cantidad})
                </NavLink>

                {usuario ? (
                    <div className="d-flex align-items-center gap-3">
                        <span style={{ color: '#00ff88' }}>
                            Hola, {usuario.nombre}
                        </span>

                        {usuario.role === 'Vendedor' && <NavLink to="/vendedor" className="btn btn-outline">Panel Vendedor</NavLink>}
                        {usuario.role === 'Administrador' && (
                            <NavLink
                                to="/admin"
                                className="btn btn-outline"
                                style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }}
                    >
                        ⚙️ Admin

                    </NavLink>
                        )}              
                        <button
                            className="btn btn-outline"
                            onClick={cerrarSesion}
                            > Salir
                        </button>
                    </div>
                ) : (
                    <NavLink to="/login" className="btn btn-outline">
                        Iniciar Sesión
                    </NavLink>
                )}
            </div>

        </header>
    );
}




export default Navbar;