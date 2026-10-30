export function obtenerCarrito() {
    try {
        const datos = localStorage.getItem('pixelbyte_cart');
        return datos ? JSON.parse(datos) : [];
    } catch {
        return [];
    }
}

export function guardarCarrito(carrito) {
    localStorage.setItem('pixelbyte_cart', JSON.stringify(carrito));

    // Notifica a React que el carrito cambió.
    window.dispatchEvent(new Event('pixelbyte-carrito'));
}

export function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();

    const existente = carrito.find(
        item => String(item.id) === String(producto.id)
    );

    let cantidad;

    if (existente) {
        existente.quantity += 1;
        existente.price = producto.price;
        cantidad = existente.quantity;
    } else {
        carrito.push({
            id: producto.id,
            name: producto.name,
            price: producto.price,
            img: producto.img,
            quantity: 1
        });

        cantidad = 1;
    }

    guardarCarrito(carrito);
    return cantidad;
}

export function cambiarCantidad(id, cambio) {
    const carrito = obtenerCarrito();

    const actualizado = carrito.map(item => {
        if (String(item.id) === String(id)) {
            return { ...item, quantity: item.quantity + cambio };
        }
        return item;
    }).filter(item => item.quantity > 0);

    guardarCarrito(actualizado);
}

export function eliminarDelCarrito(id) {
    const carrito = obtenerCarrito().filter(
        item => String(item.id) !== String(id)
    );

    guardarCarrito(carrito);
}

export function vaciarCarrito() {
    guardarCarrito([]);
}