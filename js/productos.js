// Configuración de Shopify
const shopifyConfig = {
    shop: window.Shopify.shop,
    storefrontAccessToken: window.Shopify.storefrontAccessToken
};

// Estado de la aplicación
let estado = {
    productosFiltrados: [],
    paginaActual: 1,
    productosPorPagina: 12,
    filtros: {
        categorias: [],
        marcas: [],
        precioMin: 0,
        precioMax: 1000
    }
};

// Funciones de utilidad
function formatearPrecio(precio) {
    return `S/ ${parseFloat(precio).toFixed(2)}`;
}

// Funciones de Shopify
async function obtenerProductos() {
    try {
        const query = `
            query {
                products(first: 50) {
                    edges {
                        node {
                            id
                            title
                            description
                            handle
                            priceRange {
                                minVariantPrice {
                                    amount
                                }
                            }
                            images(first: 1) {
                                edges {
                                    node {
                                        url
                                    }
                                }
                            }
                            collections(first: 1) {
                                edges {
                                    node {
                                        title
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const response = await fetch(`https://${shopifyConfig.shop}/api/2024-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        return data.data.products.edges.map(edge => ({
            id: edge.node.id,
            nombre: edge.node.title,
            descripcion: edge.node.description,
            precio: edge.node.priceRange.minVariantPrice.amount,
            imagen: edge.node.images.edges[0]?.node.url || 'assets/images/productos/default.jpg',
            categoria: edge.node.collections.edges[0]?.node.title.toLowerCase() || 'general'
        }));
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}

// Funciones de filtrado
async function aplicarFiltros() {
    let productos = await obtenerProductos();

    // Filtrar por categorías
    if (estado.filtros.categorias.length > 0) {
        productos = productos.filter(producto => 
            estado.filtros.categorias.includes(producto.categoria)
        );
    }

    // Filtrar por precio
    productos = productos.filter(producto => 
        parseFloat(producto.precio) >= estado.filtros.precioMin &&
        parseFloat(producto.precio) <= estado.filtros.precioMax
    );

    estado.productosFiltrados = productos;
    estado.paginaActual = 1;
    actualizarUI();
}

// Funciones de UI
function crearProductoCard(producto) {
    return `
        <div class="producto-card">
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <div class="producto-precio">
                    ${formatearPrecio(producto.precio)}
                </div>
                <button class="btn btn-primary" onclick="agregarAlCarrito('${producto.id}')">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `;
}

function actualizarUI() {
    // Actualizar contador de productos
    document.getElementById('totalProductos').textContent = estado.productosFiltrados.length;

    // Calcular productos para la página actual
    const inicio = (estado.paginaActual - 1) * estado.productosPorPagina;
    const fin = inicio + estado.productosPorPagina;
    const productosPagina = estado.productosFiltrados.slice(inicio, fin);

    // Actualizar grid de productos
    const productosGrid = document.getElementById('productosGrid');
    productosGrid.innerHTML = productosPagina.map(crearProductoCard).join('');

    // Actualizar paginación
    actualizarPaginacion();
}

function actualizarPaginacion() {
    const totalPaginas = Math.ceil(estado.productosFiltrados.length / estado.productosPorPagina);
    const paginas = document.querySelector('.paginas');
    
    let html = '';
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= estado.paginaActual - 1 && i <= estado.paginaActual + 1)) {
            html += `
                <button class="btn btn-outline ${i === estado.paginaActual ? 'active' : ''}" 
                        onclick="cambiarPagina(${i})">${i}</button>
            `;
        } else if (i === estado.paginaActual - 2 || i === estado.paginaActual + 2) {
            html += '<span>...</span>';
        }
    }
    
    paginas.innerHTML = html;
}

// Funciones de carrito
async function agregarAlCarrito(variantId) {
    try {
        const mutation = `
            mutation createCart($input: CartInput!) {
                cartCreate(input: $input) {
                    cart {
                        id
                        checkoutUrl
                        lines(first: 10) {
                            edges {
                                node {
                                    quantity
                                    merchandise {
                                        ... on ProductVariant {
                                            id
                                            title
                                            price {
                                                amount
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const variables = {
            input: {
                lines: [{
                    merchandiseId: variantId,
                    quantity: 1
                }]
            }
        };

        const response = await fetch(`https://${shopifyConfig.shop}/api/2024-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken
            },
            body: JSON.stringify({
                query: mutation,
                variables
            })
        });

        const data = await response.json();
        if (data.data?.cartCreate?.cart) {
            localStorage.setItem('cartId', data.data.cartCreate.cart.id);
            actualizarContadorCarrito();
            alert('Producto agregado al carrito');
        }
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        alert('Error al agregar el producto al carrito');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar filtros
    const checkboxes = document.querySelectorAll('.filtro-opciones input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const tipo = e.target.closest('.filtro-seccion').querySelector('h4').textContent.toLowerCase();
            if (tipo === 'categorías') {
                if (e.target.checked) {
                    estado.filtros.categorias.push(e.target.value);
                } else {
                    estado.filtros.categorias = estado.filtros.categorias.filter(cat => cat !== e.target.value);
                }
            }
            aplicarFiltros();
        });
    });

    // Inicializar rango de precios
    const precioRange = document.getElementById('precioRange');
    const precioMin = document.getElementById('precioMin');
    const precioMax = document.getElementById('precioMax');

    precioRange.addEventListener('input', (e) => {
        estado.filtros.precioMax = parseInt(e.target.value);
        precioMax.value = e.target.value;
        aplicarFiltros();
    });

    precioMin.addEventListener('change', (e) => {
        estado.filtros.precioMin = parseInt(e.target.value) || 0;
        aplicarFiltros();
    });

    precioMax.addEventListener('change', (e) => {
        estado.filtros.precioMax = parseInt(e.target.value) || 1000;
        aplicarFiltros();
    });

    // Inicializar UI
    await aplicarFiltros();
});

// Funciones de navegación
function cambiarPagina(pagina) {
    estado.paginaActual = pagina;
    actualizarUI();
}

function limpiarFiltros() {
    estado.filtros = {
        categorias: [],
        marcas: [],
        precioMin: 0,
        precioMax: 1000
    };
    
    // Resetear checkboxes
    document.querySelectorAll('.filtro-opciones input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Resetear rango de precios
    document.getElementById('precioRange').value = 500;
    document.getElementById('precioMin').value = '';
    document.getElementById('precioMax').value = '';
    
    aplicarFiltros();
} 