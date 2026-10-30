export function obtenerUsuarios(){
    return JSON.parse(localStorage.getItem('pixelbyte_users')) || [];
}

export function guardarUsuarios(usuarios){
    localStorage.setItem('pixelbyte_users', JSON.stringify(usuarios));
}

export function inicializarUsuarios(){
    if (localStorage.getItem('pixelbyte_users') !== null){
        return;
    }

    const usuariosInciales = [
            { email: 'admin@duoc.cl', password: '123456', nombre: 'Admin PixelByte', role: 'Administrador' },
            { email: 'vendedor@profesor.duoc.cl', password: '123456', nombre: 'Vendedor Tienda', role: 'Vendedor' },
            { email: 'cliente@gmail.com', password: '123456', nombre: 'Juan Pérez', role: 'Cliente' }
    ];


    guardarUsuarios(usuariosInciales);

}
