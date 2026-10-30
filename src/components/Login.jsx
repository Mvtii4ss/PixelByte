import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import {
    obtenerUsuarios,
    inicializarUsuarios
} from '../services/usuarios.js';

import { guardarSesion } from '../services/sesion.js';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        inicializarUsuarios();
    }, []);

    function handleLogin(evento) {
        evento.preventDefault();
        setError('');

        const correo = email.trim().toLowerCase();
        const dominios = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
        if (!correo || correo.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !dominios.some(d => correo.endsWith(d))) {
            setError('Ingresa un correo válido @duoc.cl, @profesor.duoc.cl o @gmail.com (máx. 100 caracteres).');
            return;
        }
        if (password.length < 4 || password.length > 10) {
            setError('La contraseña debe tener entre 4 y 10 caracteres.');
            return;
        }

        const usuario = obtenerUsuarios().find(
            u =>
                u.email.toLowerCase() === correo &&
                u.password === password
        );

        if (!usuario) {
            setError('Correo o contraseña incorrectos.');
            return;
        }

        guardarSesion(usuario);
        navigate('/');
    }

    return (
        <main className="auth-container">
            <div className="auth-card">
                <h2>Iniciar Sesión</h2>

                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            minLength={4}
                            maxLength={10}
                            required
                        />
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <button className="btn btn-primary" type="submit">
                        Ingresar
                    </button>
                </form>
                <div className="auth-footer">
                    <p>
                        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
                    </p>
                </div>

            </div>
        </main>
    );
}

export default Login;