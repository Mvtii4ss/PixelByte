import { useState } from 'react';
import { Link } from 'react-router-dom';
function Footer() {
    const [email, setEmail] = useState('');
    const [aviso, setAviso] = useState('');
    function suscribir(e) {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAviso('Ingresa un correo válido.'); return; }
        setAviso('¡Gracias! Suscripción simulada correctamente.'); setEmail('');
    }
    return <footer className="footer"><div className="footer-container">
        <div className="footer-brand"><h3><span>Pixel</span>Byte</h3><p>Tu tienda de confianza para armar tu PC Gaming.</p>
            <p><Link to="/nosotros">Nosotros</Link> · <Link to="/noticias">Noticias</Link> · <Link to="/contacto">Contacto</Link></p></div>
        <div className="footer-newsletter"><h4>Mantente en contacto</h4><p>Suscríbete para recibir ofertas exclusivas.</p>
            <form className="newsletter-form" onSubmit={suscribir}><input aria-label="Correo de suscripción" type="email" placeholder="Ingresa tu correo" value={email} onChange={e=>setEmail(e.target.value)} required/><button type="submit" className="btn btn-primary">Suscribirse</button></form>
            {aviso && <small role="status">{aviso}</small>}</div></div>
        <div className="footer-bottom"><p>© 2026 PixelByte. Todos los derechos reservados.</p></div>
    </footer>;
}
export default Footer;
