import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { autenticar } from '../services/sesion.js';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const googleButton=useRef(null);
    const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID;
    useEffect(()=>{
        if(!clientId)return;
        let active=true;
        function iniciar(){if(!active||!window.google?.accounts?.id||!googleButton.current)return;
            window.google.accounts.id.initialize({client_id:clientId,callback:async ({credential})=>{
                try {const u=await autenticar('google',{credential});navigate(u.role==='Administrador'?'/admin':u.role==='Vendedor'?'/vendedor':'/');}catch(e){setError(e.message);}
            }});
            googleButton.current.replaceChildren();window.google.accounts.id.renderButton(googleButton.current,{theme:'outline',size:'large',text:'signin_with',locale:'es'});
        }
        let script=document.getElementById('google-gis');
        if(!script){script=document.createElement('script');script.id='google-gis';script.src='https://accounts.google.com/gsi/client';script.async=true;document.head.appendChild(script);}
        script.addEventListener('load',iniciar);const fail=()=>setError('No se pudo cargar Google Sign-In.');script.addEventListener('error',fail);iniciar();
        return ()=>{active=false;script.removeEventListener('load',iniciar);script.removeEventListener('error',fail);};
    },[clientId,navigate]);
    async function handleLogin(evento){evento.preventDefault();setError('');try{const u=await autenticar('login',{email:email.trim().toLowerCase(),password});navigate(u.role==='Administrador'?'/admin':u.role==='Vendedor'?'/vendedor':'/');}catch(e){setError(e.message);}}

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
                <div className="my-3 d-flex justify-content-center" ref={googleButton} />
                {!clientId && <p className="small text-secondary">Google: configura VITE_GOOGLE_CLIENT_ID para habilitar el acceso.</p>}
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