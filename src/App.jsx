import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Productos from './components/Productos.jsx';
import Carrito from './components/Carrito.jsx';
import Checkout from './components/Checkout.jsx';
import Login from './components/Login.jsx';
import { obtenerSesion } from './services/sesion.js';
import Admin from './components/Admin.jsx';
import Registro from './components/Registro.jsx';
import Contacto from './components/Contacto.jsx';
import DetalleProducto from './components/DetalleProducto.jsx';
import Nosotros from './components/Nosotros.jsx';
import { Noticias, DetalleNoticia } from './components/Noticias.jsx';
import Footer from './components/Footer.jsx';
import Vendedor from './components/Vendedor.jsx';





function Inicio() {
    return (
        <>
            <section className="hero">
                <div className="hero-content">
                    <h1>HARDWARE & PERIFÉRICOS <span>NEXT-GEN</span></h1>
                    <p>Encuentra los mejores componentes gaming con envío a todo Chile.</p>
                </div>
            </section>

            <Productos />
        </>
    );
}

function Pagina({ titulo }) {
    return (
        <main className="container my-5">
            <h1>{titulo}</h1>
            <p>Esta vista se encuentra en desarrollo.</p>
        </main>
    );
}

function RutaAdmin() {
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

    if (usuario?.role !== 'Administrador') {
        return <Navigate to="/" replace />;
    }

    return <Admin />;
}


function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/producto/:id" element={<DetalleProducto />} />
                <Route path="/categorias" element={<Productos vista="categorias" />} />
                <Route path="/ofertas" element={<Productos vista="ofertas" />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/noticias/:id" element={<DetalleNoticia />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                <Route path="/admin" element={<RutaAdmin />} />
                <Route path="/vendedor" element={obtenerSesion()?.role === "Vendedor" ? <Vendedor /> : <Navigate to="/" replace />} />

            </Routes>
            <Footer />
        </>
    );
}

export default App;