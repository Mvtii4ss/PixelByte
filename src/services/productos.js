export const featuredProducts = [
    { id: 'PROD-01', name: 'Tarjeta de Video RTX 4070', price: 650000, img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-02', name: 'Teclado Mecánico RGB', price: 45000, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-03', name: 'Mouse Gaming 16000 DPI', price: 25000, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-04', name: 'Audífonos 7.1 Surround', price: 38000, img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-05', name: 'Monitor Gamer 27" 165Hz IPS', price: 210000, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-06', name: 'Gabinete Gamer ATX Vidrio Templado', price: 75000, img: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-07', name: 'Micrófono Condensador USB Studio', price: 52000, img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-08', name: 'Procesador AMD Ryzen 7 5700X', price: 185000, img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-09', name: 'Memoria RAM 16GB (2x8GB) DDR4 RGB', price: 58000, img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-10', name: 'Control Inalámbrico PC / Consola', price: 42000, img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
    { id: 'PROD-11', name: 'Notebook Gamer RTX 4060 15.6"', price: 980000, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80' }
];

export function guardarProductos(productos){
    localStorage.setItem('pixelbyte_products', JSON.stringify(productos));
}

export function getProducts(){
    const stored = localStorage.getItem('pixelbyte_products');

    if (stored === null){
        guardarProductos(featuredProducts);
        return featuredProducts;
    }

    return JSON.parse(stored);

}