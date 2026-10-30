const dominiosPermitidos = [
    '@duoc.cl',
    '@profesor.duoc.cl',
    '@gmail.com'
];

export function validarRun(run) {
    const valor = run.toUpperCase().trim();

    if (!/^[0-9]{7,8}[0-9K]$/.test(valor)) {
        return false;
    }

    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1);

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resultado = 11 - (suma % 11);

    const esperado = resultado === 11
        ? '0'
        : resultado === 10 ? 'K' : String(resultado);

    return dv === esperado;
}

export function validarCampoRegistro(campo, datos, usuarios = []) {
    const valor = String(datos[campo] ?? '').trim();

    switch (campo) {
        case 'run':
            if (!valor) return 'El RUN es obligatorio.';
            if (!validarRun(valor)) {
                return 'RUN inválido (sin puntos ni guión, ej: 19011022K).';
            }
            return '';

        case 'nombre':
            if (!valor) return 'El nombre es obligatorio.';
            if (valor.length > 50) {
                return 'El nombre no puede superar los 50 caracteres.';
            }
            return '';

        case 'apellidos':
            if (!valor) return 'Los apellidos son obligatorios.';
            if (valor.length > 100) {
                return 'Los apellidos no pueden superar los 100 caracteres.';
            }
            return '';

        case 'email':
            if (!valor) return 'El correo electrónico es obligatorio.';
            if (valor.length > 100) {
                return 'El correo no puede superar los 100 caracteres.';
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
                return 'Ingrese un correo electrónico válido.';
            }
            if (!dominiosPermitidos.some(d => valor.toLowerCase().endsWith(d))) {
                return 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
            }
            if (usuarios.some(u => u.email.toLowerCase() === valor.toLowerCase())) {
                return 'Error, este correo ya se encuentra registrado.';
            }
            return '';

        case 'confirmarEmail':
            if (!valor) return 'Por favor confirme su correo electrónico.';
            if (valor !== datos.email.trim()) {
                return 'Los correos no coinciden.';
            }
            return '';

        case 'password':
            if (!valor) return 'La contraseña es obligatoria.';
            if (datos.password.length < 4 || datos.password.length > 10) {
                return 'La contraseña debe tener entre 4 y 10 caracteres.';
            }
            return '';

        case 'confirmarPassword':
            if (!valor) return 'Por favor confirme su contraseña.';
            if (datos.password !== datos.confirmarPassword) {
                return 'Las contraseñas no coinciden.';
            }
            return '';

        case 'region':
            return valor ? '' : 'Debe seleccionar una región.';

        case 'comuna':
            return valor ? '' : 'Debe seleccionar una comuna.';

        case 'direccion':
            if (!valor) return 'La dirección es obligatoria.';
            if (valor.length > 300) {
                return 'La dirección no puede superar los 300 caracteres.';
            }
            return '';

        default:
            return '';
    }
}

export function validarRegistro(datos, usuarios = []) {
    const campos = [
        'run', 'nombre', 'apellidos',
        'email', 'confirmarEmail',
        'password', 'confirmarPassword',
        'region', 'comuna', 'direccion'
    ];

    const errores = {};

    campos.forEach(campo => {
        const mensaje = validarCampoRegistro(campo, datos, usuarios);

        if (mensaje) {
            errores[campo] = mensaje;
        }
    });

    return errores;
}