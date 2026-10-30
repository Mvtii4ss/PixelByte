import {
    guardarUsuarios, 
    obtenerUsuarios,
    inicializarUsuarios
} from './services/usuarios.js'

import {
    guardarProductos,
    getProducts
} from './services/productos.js'

import {
    obtenerSesion,
    guardarSesion,
    cerrarSesion
} from './services/sesion.js'

const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

const regionesYComunas = [
    {
        region: "Región Metropolitana de Santiago",
        comunas: ["Santiago", "Providencia", "Las Condes", "La Florida", "Maipú", "Puente Alto", "Ñuñoa"]
    },
    {
        region: "Región de Valparaíso",
        comunas: ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana"]
    },
    {
        region: "Región del Biobío",
        comunas: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Los Ángeles"]
    }
];

function initRegisterRegionComuna() {
    const regionSelect = document.getElementById('regionreg');
    const comunaSelect = document.getElementById('comunareg');
    if (!regionSelect || !comunaSelect) return;

    regionSelect.innerHTML = '<option value="">Seleccione Región</option>';
    regionesYComunas.forEach(item => {
        const option = document.createElement('option');
        option.value = item.region;
        option.textContent = item.region;
        regionSelect.appendChild(option);
    });

    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        comunaSelect.innerHTML = '<option value="">Seleccione Comuna</option>';

        if (!selectedRegion) {
            comunaSelect.disabled = true;
            return;
        }

        const regionData = regionesYComunas.find(r => r.region === selectedRegion);
        if (regionData) {
            regionData.comunas.forEach(comuna => {
                const option = document.createElement('option');
                option.value = comuna;
                option.textContent = comuna;
                comunaSelect.appendChild(option);
            });
            comunaSelect.disabled = false;
        }
    });
}


// Validador de RUN Chileno (Módulo 11 sin puntos ni guion)
function validateRun(run) {
    run = run.toUpperCase().trim();
    if (!/^[0-9]{7,8}[0-9K]$/.test(run)) return false;

    const body = run.slice(0, -1);
    const dv = run.slice(-1);
    let suma = 0;
    let multiplicador = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        suma += parseInt(body.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvCalc = '0';
    if (dvEsperado === 10) dvCalc = 'K';
    else if (dvEsperado !== 11) dvCalc = dvEsperado.toString();

    return dv === dvCalc;
}

function getContactMessages() {
    return JSON.parse(localStorage.getItem('pixelbyte_messages')) || [];
}

function getCart() {
    const data = localStorage.getItem('pixelbyte_cart');
    if (!data || data === "undefined") return [];
    try { return JSON.parse(data); } catch (e) { return []; }
}

function saveCart(cart) {
    localStorage.setItem('pixelbyte_cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const cartCounter = document.getElementById('cart-count');
    if (!cartCounter) return;
    const cart = getCart();
    const total = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCounter.textContent = total;
}

function addCart(productId) {
    const cart = getCart();
    const products = getProducts(); 
    const product = products.find(p => p.id === productId); 
    if (!product) return;

    const itemInCart = cart.find(item => item.id === productId);
    if (itemInCart) {
        itemInCart.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            quantity: 1
        });
    }
    saveCart(cart);
    updateCartCounter();
    renderCartItems();
    alert(`¡${product.name} fue agregado al carrito!`);
}

function resetProductForm() {
    const form = document.getElementById('productForm');
    if (!form) return;
    form.reset();
    document.getElementById('prodEditId').value = '';
    
    const formTitle = document.getElementById('form-title');
    if (formTitle) formTitle.textContent = 'Agregar Nuevo Producto';
    
    const btnCancel = document.getElementById('btnCancelEdit');
    if (btnCancel) btnCancel.classList.add('hidden');
}

function changeQuantity(productId, delta) {
    let cart = getCart();

    const item = cart.find(
        i => String(i.id) === String(productId)
    );    

    if (item) {

        item.quantity += delta;

        if (item.quantity <= 0) {

            cart = cart.filter(
                i => String(i.id) !== String(productId)
            );
        
        }

        saveCart(cart);
        updateCartCounter();
        renderCartItems();
    }
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== productId);
    saveCart(cart);
    updateCartCounter();
    renderCartItems();
}

function clearCart() {
    const cart = getCart();
    if (cart.length === 0) return;
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
        localStorage.removeItem('pixelbyte_cart');
        updateCartCounter();
        renderCartItems();
    }
}

function renderCartItems() {
    const cartContainer = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');
    if (!cartContainer) return;

    const cart = getCart();
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>El carrito está vacío.</p>';
        if (totalElement) totalElement.textContent = '$0';
        return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <span class="cart-item-title">${item.name}</span>
                    <span class="cart-item-price">$${item.price.toLocaleString('es-CL')} c/u</span>
                </div>
                <div class="cart-item-qty">
                    <button class="btn-qty" data-id="${item.id}" data-delta="-1">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-qty" data-id="${item.id}" data-delta="1">+</button>
                </div>
                <div class="cart-item-total">$${itemTotal.toLocaleString('es-CL')}</div>
                <button type="button" class="btn-delete" 
                    data-remove-id='${item.id}'title="Eliminar producto">🗑️</button>
            </div>
        `;
    }).join('');

    if (totalElement) totalElement.textContent = `$${total.toLocaleString('es-CL')}`;
}

function processCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de pagar.');
        return;
    }

    alert(`¡Gracias por tu compra! Tu pedido ha sido procesado con éxito.`);
    localStorage.removeItem('pixelbyte_cart');
    updateCartCounter();
    renderCartItems();
}

function deleteUser(email) {
    const activeUser = obtenerSesion();
    
    // Evitar que el admin se elimine a sí mismo
    if (activeUser && activeUser.email.toLowerCase() === email.toLowerCase()) {
        alert('No puedes eliminar tu propia cuenta mientras estás logueado.');
        return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${email}?`)) return;

    const users = obtenerUsuarios();
    const usuariosActualizados = users.filter(
        u => u.email.toLowerCase() !== email.toLowerCase()
    );
    
    guardarUsuarios(usuariosActualizados);
    renderAdminUsers();
}

function updateNavbar() {
    const userNavContainer = document.getElementById('user-nav-container');
    if (!userNavContainer) return;

    const activeUser = obtenerSesion();
    if (!activeUser || !activeUser.email || !activeUser.nombre) {
        userNavContainer.innerHTML = `
            <a href="login.html" class="btn btn-outline">
                Iniciar Sesión
            </a>
        `;
        return;
    }

    if (activeUser) {
        if (activeUser.role === 'Administrador') {
            userNavContainer.innerHTML = `
                <a href="admin-home.html" class="btn btn-outline" style="border-color:#ff4d4d; color:#ff4d4d;">⚙️ Admin</a>
                <button id="logoutBtn" class="btn btn-outline" style="margin-left:8px;">Salir</button>
            `;
        } else {
            userNavContainer.innerHTML = `
                <span style="margin-right:10px; font-size:0.9rem; color:#00ff88;">Hola, ${activeUser.nombre}</span>
                <button id="logoutBtn" class="btn btn-outline">Salir</button>
            `;
        }
        document.getElementById('logoutBtn').addEventListener('click', () => {
            cerrarSesion();
            window.location.reload();
        });
    }
}

function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const products = getProducts();
    if (products.length === 0) {
        container.innerHTML = '<p>No hay productos disponibles por el momento.</p>';
        return;
    }

    container.innerHTML = products.map(prod => `
        <div class="product-card">
            <a href="producto.html?id=${prod.id}" class="product-card-link">
                <img src="${prod.img}" alt="${prod.name}">
                <h3>${prod.name}</h3>
            </a>
            <p class="product-price">$${prod.price.toLocaleString('es-CL')}</p>
            <button class="btn btn-primary btn-add-cart" data-id="${prod.id}">Añadir al Carrito</button>
        </div>
    `).join('');
}

function renderProductDetail() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <h2>Producto no encontrado</h2>
                <a href="index.html" class="btn btn-primary" style="margin-top:15px;">Regresar a la tienda</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="product-detail-grid">
            <div class="product-detail-img">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <p class="product-detail-price">$${product.price.toLocaleString('es-CL')}</p>
                <p class="product-detail-desc">
                    Excelente componente tecnológico garantizado por PixelByte. Producto de alta calidad diseñado para ofrecer el máximo rendimiento en tu setup.
                </p>
                <button type="button" class="btn btn-primary btn-lg btn-add-cart"
                    data-id="${product.id}">
                    Añadir al Carrito 🛒
                </button>
            </div>
        </div>
    `;
}


function checkAdminAccess() {
    const activeUser = obtenerSesion();

    if (!activeUser || activeUser.role !== 'Administrador') {
        alert('Acceso denegado. Se requieren permisos de Administrador.');
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

function renderAdminProducts() {
    const productsList = document.getElementById('admin-products-list');
    if (!productsList) return;

    const products = JSON.parse(localStorage.getItem('pixelbyte_products')) || [];
    
    if (products.length === 0) {
        productsList.innerHTML = '<tr><td colspan="7">No hay productos registrados.</td></tr>';
        return;
    }

    productsList.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.img || 'https://via.placeholder.com/50'}" alt="${p.name}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
            <td>${p.code || 'N/A'}</td>
            <td>${p.name}</td>
            <td>${p.category || 'N/A'}</td>
            <td>$${Number(p.price).toLocaleString('es-CL')}</td>
            <td>${p.stock ?? 0}</td>
            <td>
                <button type="button" class="btn-sm btn-edit"
                    data-id="${p.id}" data-action="edit"> Editar </button>

                <button type="button" class="btn-sm btn-delete" 
                    data-id="${p.id}" data-action="delete"> Eliminar </button>
            </td>
        </tr>
    `).join('');
}

function editProduct(id) {
    const products = getProducts();
    const prod = products.find(p => String(p.id) === String(id));
    if (!prod) return;

    document.getElementById('prodEditId').value = prod.id;
    document.getElementById('prodCode').value = prod.code || '';
    document.getElementById('prodName').value = prod.name || '';
    document.getElementById('prodDesc').value = prod.desc || '';
    document.getElementById('prodPrice').value = prod.price || 0;
    document.getElementById('prodStock').value = prod.stock || 0;
    document.getElementById('prodStockCritico').value = prod.stockCritico || '';
    document.getElementById('prodCategory').value = prod.category || '';
    document.getElementById('prodImg').value = prod.img || '';

    const formTitle = document.getElementById('form-title');
    if (formTitle) formTitle.textContent = 'Editar Producto';

    const btnCancel = document.getElementById('btnCancelEdit');
    if (btnCancel) btnCancel.classList.remove('hidden');
}

function deleteProduct(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    let products = getProducts();
    products = products.filter(p => String(p.id) !== String(id));
    guardarProductos(products);
    renderAdminProducts();
}

function renderAdminMessages() {
    const container = document.getElementById('admin-messages-list');
    if (!container) return;

    const messages = getContactMessages();
    if (messages.length === 0) {
        container.innerHTML = '<p>No hay mensajes recibidos.</p>';
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="message-card">
            <div class="message-header">
                <strong>${msg.nombre}</strong> (${msg.email})
                <span>${msg.fecha}</span>
            </div>
            <p>${msg.motivo}</p>
            <button type="button" class="btn-sm btn-delete"
                data-message-id="${msg.id}">
                Eliminar Mensaje
            </button>
        </div>
    `).join('');
}

// Inicializador de Regiones y Comunas en el Admin
function initAdminUserRegionComuna() {
    const regionSelect = document.getElementById('userAdminRegion');
    const comunaSelect = document.getElementById('userAdminComuna');
    if (!regionSelect || !comunaSelect) return;

    regionSelect.innerHTML = '<option value="">Seleccione Región</option>';
    regionesYComunas.forEach(item => {
        const option = document.createElement('option');
        option.value = item.region;
        option.textContent = item.region;
        regionSelect.appendChild(option);
    });

    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value;
        comunaSelect.innerHTML = '<option value="">Seleccione Comuna</option>';

        if (!selectedRegion) {
            comunaSelect.disabled = true;
            return;
        }

        const regionData = regionesYComunas.find(r => r.region === selectedRegion);
        if (regionData) {
            regionData.comunas.forEach(comuna => {
                const option = document.createElement('option');
                option.value = comuna;
                option.textContent = comuna;
                comunaSelect.appendChild(option);
            });
            comunaSelect.disabled = false;
        }
    });
}

// Renderizar la lista de Usuarios en el Admin
function renderAdminUsers() {
    const usersTable = document.getElementById('admin-users-list');
    if (!usersTable) return;

    const users = obtenerUsuarios();
    if (users.length === 0) {
        usersTable.innerHTML = '<tr><td colspan="6">No hay usuarios registrados.</td></tr>';
        return;
    }

    usersTable.innerHTML = users.map(u => `
        <tr>
            <td>${u.run || 'N/A'}</td>
            <td>${u.nombre} ${u.apellidos || ''}</td>
            <td>${u.email}</td>
            <td><strong>${u.role}</strong></td>
            <td>${u.comuna ? u.comuna + ', ' + u.region : 'N/A'}</td>
            <td>
                <button type="button" class="btn-sm btn-delete"
                    data-email="${u.email}">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}


function cleanCorruptedMessages() {
    let messages = JSON.parse(localStorage.getItem('pixelbyte_messages')) || [];
    messages = messages.filter(m => m && (m.nombre || m.email || m.mensaje || m.msg));
    localStorage.setItem('pixelbyte_messages', JSON.stringify(messages));
    renderAdminMessages();
}

function deleteMessage(id){
    const mensajes = getContactMessages();

    const mensajesActualizados = mensajes.filter(
        mensaje => String(mensaje.id) !== String(id)
    );

    localStorage.setItem(
        'pixelbyte_messages',
        JSON.stringify(mensajesActualizados)
    )

    renderAdminMessages();
}

function initAdminTabs() {
    const menuButtons = document.querySelectorAll('.admin-menu .menu-btn');
    const tabs = document.querySelectorAll('.admin-tab');

    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            menuButtons.forEach(b => b.classList.remove('active'));
            tabs.forEach(tab => tab.classList.add('hidden'));

            btn.classList.add('active');
            const targetTab = document.getElementById(targetId);
            if (targetTab) targetTab.classList.remove('hidden');

            if (targetId === 'section-productos') renderAdminProducts();
            if (targetId === 'section-usuarios') renderAdminUsers();
            if (targetId === 'section-mensajes') renderAdminMessages();
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {

    inicializarUsuarios();
    updateNavbar();
    renderFeaturedProducts();
    updateCartCounter();
    renderCartItems();

    document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);
    document.getElementById('checkout-btn')?.addEventListener('click', processCheckout);

    
    const listaMensajes = document.getElementById('admin-messages-list');   
    if(listaMensajes){
        listaMensajes.addEventListener('click', (e) => {
            const boton = e.target.closest('button[data-message-id]');

            if(!boton) return;

            deleteMessage(boton.dataset.messageId);
        });
    }


    const contenedor = document.getElementById('cart-items-container');
    if (contenedor){
        contenedor.addEventListener('click', (event) => {

            const btnCantidad = event.target.closest('button[data-delta]');
            
            if (btnCantidad){
                changeQuantity(
                        btnCantidad.dataset.id,
                        Number(btnCantidad.dataset.delta)
                );

                return;

            }

            const btnEliminar = event.target.closest('button[data-remove-id]');

            if(btnEliminar){
                removeFromCart(btnEliminar.dataset.removeId)
            }
            
        });
    }

    const tablaUsuarios = document.getElementById('admin-users-list');
    if(tablaUsuarios){
        tablaUsuarios.addEventListener('click', (event) =>{
            const boton = event.target.closest('.btn-delete');

            if(!boton) return;

            const email = boton.dataset.email;
            deleteUser(email);
        });
    }


    renderProductDetail()
    initAdminUserRegionComuna();
    renderAdminMessages()

    if (document.getElementById('admin-products-list')) {
        checkAdminAccess();

        if (document.getElementById('admin-products-list')){
            if(!checkAdminAccess()) return;
        }

        renderAdminProducts();
        renderAdminUsers();
        renderAdminMessages();
        initAdminTabs();

        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        const productForm = document.getElementById('productForm');
        const listaProductos = document.getElementById('admin-products-list');
        
        if(listaProductos){
            listaProductos.addEventListener('click', (e) =>{
               const boton = e.target.closest('button[data-action]');
               
               if(!boton) return;
               const {id, action} = boton.dataset;
               if (action == 'edit'){
                   editProduct(id);
               }
               if(action == 'delete'){
                   deleteProduct(id);
               }
            });
        }

        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', () => {
                cerrarSesion();
                window.location.href = 'login.html';
            });
        }

        if (productForm) {
           renderAdminProducts();

        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const editId = document.getElementById('prodEditId').value;
            const code = document.getElementById('prodCode').value.trim();
            const name = document.getElementById('prodName').value.trim();
            const desc = document.getElementById('prodDesc').value.trim();
            const price = parseFloat(document.getElementById('prodPrice').value);
            const stock = parseInt(document.getElementById('prodStock').value);
            const stockCriticoVal = document.getElementById('prodStockCritico').value;
            const stockCritico = stockCriticoVal ? parseInt(stockCriticoVal) : 0;
            const category = document.getElementById('prodCategory').value;
            const img = document.getElementById('prodImg').value.trim();

            let products = getProducts();

            if (editId) {
                // Modo Edición
                const index = products.findIndex(p => String(p.id) === String(editId));
                if (index !== -1) {
                    products[index] = { ...products[index], code, name, desc, price, stock, stockCritico, category, img };
                    alert('¡Producto actualizado correctamente!');
                }
            } else {
                // Modo Nuevo
                const newProduct = {
                    id: Date.now().toString(),
                    code,
                    name,
                    desc,
                    price,
                    stock,
                    stockCritico,
                    category,
                    img: img || 'https://via.placeholder.com/150'
                };
                products.push(newProduct);
                alert('¡Producto guardado exitosamente!');
            }

            guardarProductos(products);
            resetProductForm();
            renderAdminProducts();
    });

    const btnCancel = document.getElementById('btnCancelEdit');
    if (btnCancel) {
        btnCancel.addEventListener('click', resetProductForm);
    }
    }}

    const userAdminForm = document.getElementById('userAdminForm');
    if (userAdminForm) {
        userAdminForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const run = document.getElementById('userAdminRun').value.trim();
            const nombre = document.getElementById('userAdminNombre').value.trim();
            const apellidos = document.getElementById('userAdminApellidos').value.trim();
            const email = document.getElementById('userAdminEmail').value.trim().toLowerCase();
            const password = document.getElementById('userAdminPassword').value;
            const fechaNac = document.getElementById('userAdminFechaNac').value;
            const role = document.getElementById('userAdminRole').value;
            const region = document.getElementById('userAdminRegion').value;
            const comuna = document.getElementById('userAdminComuna').value;
            const direccion = document.getElementById('userAdminDireccion').value.trim();

            // 1. Validar RUN
            if (!validateRun(run)) {
                alert('El RUN no es válido. Ingrésalo sin puntos ni guion (Ej: 19011022K).');
                return;
            }

            // 2. Validar Dominio de Correo
            const isValidDomain = allowedDomains.some(domain => email.endsWith(domain));
            if (!isValidDomain) {
                alert('El correo debe tener un dominio permitido (@duoc.cl, @profesor.duoc.cl, @gmail.com).');
                return;
            }

            const users = obtenerUsuarios();

            // 3. Validar Correo Duplicado
            if (users.some(u => u.email.toLowerCase() === email)) {
                alert('El correo ya se encuentra registrado en el sistema.');
                return;
            }

            // 4. Guardar Usuario
            users.push({
                run,
                nombre,
                apellidos,
                email,
                password,
                fechaNac,
                role,
                region,
                comuna,
                direccion
            });

            guardarUsuarios(users);
            alert(`¡Usuario ${nombre} (${role}) creado exitosamente!`);

            userAdminForm.reset();
            document.getElementById('userAdminComuna').disabled = true;
            renderAdminUsers();
        });
    }


        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const emailError = document.getElementById('emailError');
            const passError = document.getElementById('passError');
            const loginAlert = document.getElementById('loginAlert');

            function validateEmail() {
                const email = emailInput.value.trim();
                emailError.textContent = '';
                if (!email) { emailError.textContent = 'El correo electrónico es obligatorio.'; return false; }
                if (email.length > 100) { emailError.textContent = 'El correo no puede superar los 100 caracteres.'; return false; }
                const isValidDomain = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
                if (!isValidDomain) { emailError.textContent = 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.'; return false; }
                return true;
            }

            function validatePassword() {
                const password = passwordInput.value;
                passError.textContent = '';
                if (!password) { passError.textContent = 'La contraseña es obligatoria.'; return false; }
                if (password.length < 4 || password.length > 10) { passError.textContent = 'La contraseña debe tener entre 4 y 10 caracteres.'; return false; }
                return true;
            }

            emailInput.addEventListener('input', validateEmail);
            passwordInput.addEventListener('input', validatePassword);

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (loginAlert) { loginAlert.classList.add('hidden'); loginAlert.textContent = ''; }

                if (!validateEmail() || !validatePassword()) return;

                const emailVal = emailInput.value.trim().toLowerCase();
                const passVal = passwordInput.value;
                const users = obtenerUsuarios();
                const userFound = users.find(u => u.email.toLowerCase() === emailVal && u.password === passVal);

                if (!userFound) {
                    if (loginAlert) {
                        loginAlert.textContent = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
                        loginAlert.classList.remove('hidden');
                    }
                    return;
                }

                guardarSesion(userFound);

                if (userFound.role === 'Administrador') window.location.href = 'admin-home.html';
                else if (userFound.role === 'Vendedor') window.location.href = 'vendedor-orders.html';
                else window.location.href = 'index.html';
            });
        }

    // Formulario Registro
    const regForm = document.getElementById('regForm');
    if (regForm) {
        initRegisterRegionComuna();


        const runInputreg = document.getElementById('runreg');
    const nombreInputreg = document.getElementById('nombrereg');
    const apellidosInputreg = document.getElementById('apellidosreg');
    const emailInputreg = document.getElementById('emailreg');
    const emailInputreg2 = document.getElementById('emailreg2');
    const passwordInputreg = document.getElementById('passwordreg');
    const passwordInputreg2 = document.getElementById('passwordreg2');
    const fechanacInputreg = document.getElementById('fechanacreg');
    const regionInputreg = document.getElementById('regionreg');
    const comunaInputreg = document.getElementById('comunareg');
    const direccionInputreg = document.getElementById('direccionreg');

    // Captura de Elementos de Error
    const runregError = document.getElementById('runregError');
    const nombreregError = document.getElementById('nombreregError');
    const apellidosregError = document.getElementById('apellidosregError');
    const emailregError = document.getElementById('emailregError');
    const emailreg2Error = document.getElementById('emailreg2Error');
    const passregError = document.getElementById('passregError');
    const passreg2Error = document.getElementById('passreg2Error');
    const regionregError = document.getElementById('regionregError');
    const comunaregError = document.getElementById('comunaregError');
    const direccionregError = document.getElementById('direccionregError');
    const regAlert = document.getElementById('regAlert');

    // Funciones de Validación
    function validateRunReg() {
        const run = runInputreg ? runInputreg.value.trim() : '';
        if (runregError) runregError.textContent = '';
        if (!run) { if (runregError) runregError.textContent = 'El RUN es obligatorio.'; return false; }
        if (!validateRun(run)) { if (runregError) runregError.textContent = 'RUN inválido (sin puntos ni guión, ej: 19011022K).'; return false; }
        return true;
    }

    function validateNombreReg() {
        const nombre = nombreInputreg.value.trim();
        if (nombreregError) nombreregError.textContent = '';
        if (!nombre) { if (nombreregError) nombreregError.textContent = 'El nombre es obligatorio.'; return false; }
        if (nombre.length > 50) { if (nombreregError) nombreregError.textContent = 'El nombre no puede superar los 50 caracteres.'; return false; }
        return true;
    }

    function validateApellidosReg() {
        const apellidos = apellidosInputreg ? apellidosInputreg.value.trim() : '';
        if (apellidosregError) apellidosregError.textContent = '';
        if (!apellidos) { if (apellidosregError) apellidosregError.textContent = 'Los apellidos son obligatorios.'; return false; }
        if (apellidos.length > 100) { if (apellidosregError) apellidosregError.textContent = 'Los apellidos no pueden superar los 100 caracteres.'; return false; }
        return true;
    }

    function validateEmailReg() {
        const email1 = emailInputreg.value.trim();
        if (emailregError) emailregError.textContent = '';
        if (!email1) { if (emailregError) emailregError.textContent = 'El correo electrónico es obligatorio.'; return false; }
        if (email1.length > 100) { if (emailregError) emailregError.textContent = 'El correo no puede superar los 100 caracteres.'; return false; }
        const isValidDomain = allowedDomains.some(domain => email1.toLowerCase().endsWith(domain));
        if (!isValidDomain) { if (emailregError) emailregError.textContent = 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.'; return false; }
        return true;
    }

    function validateEmailReg2() {
        const email1 = emailInputreg.value.trim();
        const email2 = emailInputreg2.value.trim();
        if (emailreg2Error) emailreg2Error.textContent = '';
        if (!email2) { if (emailreg2Error) emailreg2Error.textContent = 'Por favor confirme su correo electrónico.'; return false; }
        if (email1 !== email2) { if (emailreg2Error) emailreg2Error.textContent = 'Los correos no coinciden.'; return false; }
        return true;
    }

    function validatePasswordReg() {
        const pass = passwordInputreg.value;
        if (passregError) passregError.textContent = '';

        if (!pass.trim()) { 
            if (passregError) passregError.textContent = 'La contraseña es obligatoria.'; 
            return false; 
        }

        if (pass.length < 4 || pass.length > 10) { 
            if (passregError) passregError.textContent = 'La contraseña debe tener entre 4 y 10 caracteres.'; 
            return false; 
        }

        return true;
    }

    function validatePasswordReg2() {
        const pass = passwordInputreg.value;
        const pass2 = passwordInputreg2.value;
        if (passreg2Error) passreg2Error.textContent = '';
        if (!pass2) { if (passreg2Error) passreg2Error.textContent = 'Por favor confirme su contraseña.'; return false; }
        if (pass !== pass2) { if (passreg2Error) passreg2Error.textContent = 'Las contraseñas no coinciden.'; return false; }
        return true;
    }

    function validateRegionComunaReg() {
        let valid = true;
        if (regionregError) regionregError.textContent = '';
        if (comunaregError) comunaregError.textContent = '';

        if (regionInputreg && !regionInputreg.value) {
            if (regionregError) regionregError.textContent = 'Debe seleccionar una región.';
            valid = false;
        }
        if (comunaInputreg && !comunaInputreg.value) {
            if (comunaregError) comunaregError.textContent = 'Debe seleccionar una comuna.';
            valid = false;
        }
        return valid;
    }

    function validateDireccionReg() {
        const dir = direccionInputreg ? direccionInputreg.value.trim() : '';
        if (direccionregError) direccionregError.textContent = '';
        if (!dir) { if (direccionregError) direccionregError.textContent = 'La dirección es obligatoria.'; return false; }
        if (dir.length > 300) { if (direccionregError) direccionregError.textContent = 'La dirección no puede superar los 300 caracteres.'; return false; }
        return true;
    }

    // Escuchadores de eventos en tiempo real (Input / Change)
    if (runInputreg) runInputreg.addEventListener('input', validateRunReg);
    nombreInputreg.addEventListener('input', validateNombreReg);
    if (apellidosInputreg) apellidosInputreg.addEventListener('input', validateApellidosReg);
    emailInputreg.addEventListener('input', validateEmailReg);
    emailInputreg2.addEventListener('input', validateEmailReg2);
    passwordInputreg.addEventListener('input', validatePasswordReg);
    passwordInputreg2.addEventListener('input', validatePasswordReg2);
    if (regionInputreg) regionInputreg.addEventListener('change', validateRegionComunaReg);
    if (comunaInputreg) comunaInputreg.addEventListener('change', validateRegionComunaReg);
    if (direccionInputreg) direccionInputreg.addEventListener('input', validateDireccionReg);

    // Evento de Envío del Formulario
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (regAlert) { regAlert.classList.add('hidden'); regAlert.textContent = ''; }

        const vRun = runInputreg ? validateRunReg() : true;
        const v1 = validateNombreReg();
        const vAp = apellidosInputreg ? validateApellidosReg() : true;
        const v2 = validateEmailReg();
        const v3 = validateEmailReg2();
        const v4 = validatePasswordReg();
        const v5 = validatePasswordReg2();
        const vUbic = validateRegionComunaReg();
        const vDir = direccionInputreg ? validateDireccionReg() : true;

        if (!vRun || !v1 || !vAp || !v2 || !v3 || !v4 || !v5 || !vUbic || !vDir) return;

        const emailVal = emailInputreg.value.trim().toLowerCase();
        const users = obtenerUsuarios();
        if (users.some(u => u.email.toLowerCase() === emailVal)) {
            if (regAlert) {
                regAlert.textContent = 'Error, este correo ya se encuentra registrado.';
                regAlert.classList.remove('hidden');
            }
            return;
        }

        // Se guarda el objeto de cliente completo
        users.push({
            run: runInputreg ? runInputreg.value.trim() : '',
            nombre: nombreInputreg.value.trim(),
            apellidos: apellidosInputreg ? apellidosInputreg.value.trim() : '',
            email: emailVal,
            password: passwordInputreg.value,
            fechaNac: fechanacInputreg ? fechanacInputreg.value : '',
            region: regionInputreg ? regionInputreg.value : '',
            comuna: comunaInputreg ? comunaInputreg.value : '',
            direccion: direccionInputreg ? direccionInputreg.value.trim() : '',
            role: 'Cliente'
        });

        guardarUsuarios(users)
        alert('¡Registro exitoso! Ya puedes iniciar sesión.');
        window.location.href = 'login.html';
    });
    }

    // Formulario Contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const nombrecontInput = document.getElementById('contactName');
        const emailcontInput = document.getElementById('contactEmail');
        const motivocontInput = document.getElementById('contactComment');

        const nombreformError = document.getElementById('contactNameError');
        const emailformError = document.getElementById('contactEmailError');
        const motivoError = document.getElementById('contactCommentError');

        function validatenombreContact() {
            const nombre = nombrecontInput.value.trim();
            nombreformError.textContent = '';
            if (!nombre) { nombreformError.textContent = 'El nombre es obligatorio.'; return false; }
            return true;
        }

        function validateEmailContact() {
            const email = emailcontInput.value.trim();
            emailformError.textContent = '';
            if (!email) { emailformError.textContent = 'El Correo es obligatorio.'; return false; }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) { emailformError.textContent = 'Ingresa un correo válido (ejemplo: nombre@dominio.com).'; return false; }
            return true;
        }

        function validateMotivoContact() {
            const motivo = motivocontInput.value.trim();
            motivoError.textContent = '';
            if (!motivo) { motivoError.textContent = 'El mensaje es obligatorio.'; return false; }
            return true;
        }

        nombrecontInput.addEventListener('input', validatenombreContact);
        emailcontInput.addEventListener('input', validateEmailContact);
        motivocontInput.addEventListener('input', validateMotivoContact);

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validatenombreContact() || !validateEmailContact() || !validateMotivoContact()) return;

            const messages = getContactMessages();
            messages.push({
                id: 'MSG-' + Date.now(),
                nombre: nombrecontInput.value.trim(),
                email: emailcontInput.value.trim(),
                motivo: motivocontInput.value.trim(),
                fecha: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                leido: false
            });
            localStorage.setItem('pixelbyte_messages', JSON.stringify(messages));
            alert('¡Gracias por contactarnos! Tu mensaje ha sido enviado al equipo de soporte.');
            contactForm.reset();
        });
    }

    // Delegación para agregar al carrito
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-add-cart');
        if (btn) {
            const productId = btn.getAttribute('data-id');
            addCart(productId);
        }
    });
});