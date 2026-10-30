import { useState } from 'react';

function Contacto() {
    const [datos, setDatos] = useState({
        nombre: '',
        email: '',
        motivo: ''
    });

    const [errores, setErrores] = useState({});
    const [enviado, setEnviado] = useState(false);

    function validar(d) {
        const e = {};

        if (!d.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
        else if (d.nombre.trim().length > 100)
            e.nombre = 'Máximo 100 caracteres.';

        if (!d.email.trim()) e.email = 'El correo es obligatorio.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
            e.email = 'Ingresa un correo válido.';
        else if (d.email.length > 100)
            e.email = 'Máximo 100 caracteres.';
        else if (!['@duoc.cl', '@profesor.duoc.cl', '@gmail.com']
            .some(dominio => d.email.toLowerCase().endsWith(dominio)))
            e.email = 'Utiliza un correo Duoc o Gmail.';

        if (!d.motivo.trim()) e.motivo = 'El mensaje es obligatorio.';
        else if (d.motivo.length > 500)
            e.motivo = 'Máximo 500 caracteres.';

        return e;
    }

    function actualizar(evento) {
        const { name, value } = evento.target;
        const nuevos = { ...datos, [name]: value };

        setDatos(nuevos);
        setEnviado(false);
        setErrores(anteriores => ({
            ...anteriores,
            [name]: validar(nuevos)[name] || ''
        }));
    }

    function enviar(evento) {
        evento.preventDefault();

        const erroresActuales = validar(datos);
        setErrores(erroresActuales);

        if (Object.keys(erroresActuales).length > 0) return;

        const mensajes = JSON.parse(
            localStorage.getItem('pixelbyte_messages') || '[]'
        );

        mensajes.push({
            id: 'MSG-' + Date.now(),
            nombre: datos.nombre.trim(),
            email: datos.email.trim().toLowerCase(),
            motivo: datos.motivo.trim(),
            fecha: new Date().toLocaleString('es-CL'),
            leido: false
        });

        localStorage.setItem('pixelbyte_messages', JSON.stringify(mensajes));

        setEnviado(true);
        setDatos({ nombre: '', email: '', motivo: '' });
        setErrores({});
    }

    return (
        <main className="auth-container">
            <div className="auth-card">
                <h2>CONTÁCTANOS</h2>

                {enviado && (
                    <div className="alert alert-success">
                        ¡Mensaje enviado correctamente!
                    </div>
                )}

                <form onSubmit={enviar} noValidate>
                    {[
                        { name: 'nombre', label: 'Nombre', type: 'text' },
                        { name: 'email', label: 'Correo electrónico', type: 'email' }
                    ].map(campo => (
                        <div className="form-group" key={campo.name}>
                            <label>{campo.label}</label>
                            <input
                                type={campo.type}
                                name={campo.name}
                                value={datos[campo.name]}
                                onChange={actualizar}
                            />
                            <small className="error-msg">
                                {errores[campo.name]}
                            </small>
                        </div>
                    ))}

                    <div className="form-group">
                        <label>Mensaje</label>
                        <textarea
                            className="form-control"
                            name="motivo"
                            rows="5"
                            value={datos.motivo}
                            onChange={actualizar}
                        />
                        <small className="error-msg">{errores.motivo}</small>
                        <small>{datos.motivo.length}/500</small>
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Enviar mensaje
                    </button>
                </form>
            </div>
        </main>
    );
}

export default Contacto;