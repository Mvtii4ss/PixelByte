import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    obtenerUsuarios,
    guardarUsuarios,
    inicializarUsuarios
} from '../services/usuarios.js';

import {
    validarCampoRegistro,
    validarRegistro
} from '../services/validacionesRegistro.js';

const regiones = {
    'Región Metropolitana de Santiago': [
        'Santiago', 'Providencia', 'Las Condes',
        'La Florida', 'Maipú', 'Puente Alto', 'Ñuñoa'
    ],
    'Región de Valparaíso': [
        'Valparaíso', 'Viña del Mar', 'Concón',
        'Quilpué', 'Villa Alemana'
    ],
    'Región del Biobío': [
        'Concepción', 'Talcahuano',
        'San Pedro de la Paz', 'Los Ángeles'
    ]
};

function Registro() {
    const navigate = useNavigate();

    const [datos, setDatos] = useState({
        run: '',
        nombre: '',
        apellidos: '',
        email: '',
        confirmarEmail: '',
        password: '',
        confirmarPassword: '',
        fechaNac: '',
        region: '',
        comuna: '',
        direccion: ''
    });

    const [errores, setErrores] = useState({});

    function actualizar(evento) {
        const { name, value } = evento.target;

        const nuevosDatos = {
            ...datos,
            [name]: value,
            ...(name === 'region' ? { comuna: '' } : {})
        };

        setDatos(nuevosDatos);

        const usuarios = obtenerUsuarios();

        setErrores(anteriores => {
            const actualizados = { ...anteriores };

            const comprobar = campo => {
                const mensaje = validarCampoRegistro(
                    campo,
                    nuevosDatos,
                    usuarios
                );

                if (mensaje) {
                    actualizados[campo] = mensaje;
                } else {
                    delete actualizados[campo];
                }
            };

            comprobar(name);

            if (name === 'email') comprobar('confirmarEmail');
            if (name === 'password') comprobar('confirmarPassword');
            if (name === 'region') comprobar('comuna');

            return actualizados;
        });
    }   

    function registrar(evento) {
        evento.preventDefault();
        
        inicializarUsuarios();
        
        const usuarios = obtenerUsuarios();
        const nuevosErrores = validarRegistro(datos, usuarios);
        
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
    
        if (usuarios.some(u =>
            u.run?.toUpperCase() === datos.run.toUpperCase()
        )) {
            setErrores({
                run: 'Este RUN ya se encuentra registrado.'
            });
            return;
        }
    
        const nuevoUsuario = {
            run: datos.run.trim().toUpperCase(),
            nombre: datos.nombre.trim(),
            apellidos: datos.apellidos.trim(),
            email: datos.email.trim().toLowerCase(),
            password: datos.password,
            fechaNac: datos.fechaNac,
            region: datos.region,
            comuna: datos.comuna,
            direccion: datos.direccion.trim(),
            role: 'Cliente'
        };
    
        guardarUsuarios([...usuarios, nuevoUsuario]);
    
        alert('¡Cuenta creada correctamente! Ya puedes iniciar sesión.');
        navigate('/login');
    }   

    const campos = [
        { name: 'run', label: 'RUN sin puntos ni guion', max: 9 },
        { name: 'nombre', label: 'Nombre', max: 50 },
        { name: 'apellidos', label: 'Apellidos', max: 100 },
        { name: 'email', label: 'Correo electrónico', type: 'email', max: 100 },
        { name: 'confirmarEmail', label: 'Confirmar correo', type: 'email', max: 100 },
        { name: 'password', label: 'Contraseña', type: 'password', min: 4, max: 10 },
        { name: 'confirmarPassword', label: 'Confirmar contraseña', type: 'password', min: 4, max: 10 },
        { name: 'fechaNac', label: 'Fecha de nacimiento (opcional)', type: 'date', optional: true }
    ];

    return (
        <main className="auth-container">
            <div className="auth-card">
                <h2>Crear cuenta de cliente</h2>

                <form onSubmit={registrar} noValidate>
                    {campos.map(campo => (
                        <div className="form-group" key={campo.name}>
                            <label htmlFor={campo.name}>
                                {campo.label}
                            </label>

                            <input
                                id={campo.name}
                                name={campo.name}
                                type={campo.type || 'text'}
                                value={datos[campo.name]}
                                onChange={actualizar}
                                minLength={campo.min}
                                maxLength={campo.max}
                                required={!campo.optional}
                            />
                            
                            {errores[campo.name] && (
                                <small className="text-danger d-block mt-1">
                                    {errores[campo.name]}
                                </small>
                            )}

                        </div>
                    ))}

                    <div className="form-group">
                        <label htmlFor="region">Región</label>

                        <select
                            id="region"
                            name="region"
                            value={datos.region}
                            onChange={actualizar}
                            required
                        >
                            <option value="">Selecciona una región</option>

                            {Object.keys(regiones).map(region => (
                                <option key={region} value={region}>
                                    {region}
                                </option>
                            ))}
                        </select>

                        {errores.region && <small className="text-danger">{errores.region}</small>}

                    </div>

                    <div className="form-group">
                        <label htmlFor="comuna">Comuna</label>

                        <select
                            id="comuna"
                            name="comuna"
                            value={datos.comuna}
                            onChange={actualizar}
                            disabled={!datos.region}
                            required
                        >
                            <option value="">Selecciona una comuna</option>

                            {(regiones[datos.region] || []).map(comuna => (
                                <option key={comuna} value={comuna}>
                                    {comuna}
                                </option>
                            ))}
                        </select>

                            {errores.comuna && <small className="text-danger">{errores.comuna}</small>}

                    </div>

                    <div className="form-group">
                        <label htmlFor="direccion">Dirección</label>

                        <input
                            id="direccion"
                            name="direccion"
                            value={datos.direccion}
                            onChange={actualizar}
                            maxLength={300}
                            required
                        />

                        {errores.direccion && <small className="text-danger">{errores.direccion}</small>}

                    </div>

                    <button type="submit" className="btn btn-primary">
                        Registrarse
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Registro;