export function obtenerSesion(){
    const datos = localStorage.getItem('pixelbyte_active_user');

    if (!datos) return null;

    try {
        return JSON.parse(datos);
    } catch {
        return null;
    }

}

export function guardarSesion(usuario){
    const sesion = {
        email: usuario.email,
        nombre: usuario.nombre,
        role: usuario.role
    };

    localStorage.setItem('pixelbyte_active_user', JSON.stringify(sesion));
    window.dispatchEvent(new Event('pixelbyte-sesion'));

}

export function cerrarSesion(){
    localStorage.removeItem('pixelbyte_active_user');
    window.dispatchEvent(new Event('pixelbyte-sesion'));
}