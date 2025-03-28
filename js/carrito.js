// Configuración de Shopify
const shopifyConfig = {
    shop: window.Shopify.shop,
    storefrontAccessToken: window.Shopify.storefrontAccessToken
};

// Estado del carrito
let carrito = {
    id: null,
    items: [],
    subtotal: 0,
    total: 0
};

// Cargar carrito desde Shopify
async function cargarCarrito() {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
        actualizarUI();
        return;
    }

    try {
        const query = `
            query getCart($cartId: ID!) {
                cart(id: $cartId) {
                    id
                    checkoutUrl
                    lines(first: 50) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                        price {
                                            amount
                                        }
                                        image {
                                            url
                                        }
                                    }
                                }
                            }
                        }
                    }
                    cost {
                        subtotalAmount {
                            amount
                        }
                        totalAmount {
                            amount
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
            body: JSON.stringify({
                query,
                variables: { cartId }
            })
        });

        const data = await response.json();
        if (data.data?.cart) {
            carrito = {
                id: data.data.cart.id,
                items: data.data.cart.lines.edges.map(edge => ({
                    id: edge.node.id,
                    variantId: edge.node.merchandise.id,
                    nombre: edge.node.merchandise.title,
                    precio: edge.node.merchandise.price.amount,
                    imagen: edge.node.merchandise.image?.url || 'assets/images/productos/default.jpg',
                    cantidad: edge.node.quantity
                })),
                subtotal: parseFloat(data.data.cart.cost.subtotalAmount.amount),
                total: parseFloat(data.data.cart.cost.totalAmount.amount)
            };
            actualizarUI();
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
    }
}

// Actualizar UI del carrito
function actualizarUI() {
    // Actualizar lista de productos
    const productosContainer = document.getElementById('productosCarrito');
    productosContainer.innerHTML = carrito.items.map(item => crearProductoCarritoHTML(item)).join('');

    // Actualizar resumen
    actualizarResumen();

    // Actualizar contador en el header
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = carrito.items.reduce((total, item) => total + item.cantidad, 0);
    }
}

// Crear HTML para un producto en el carrito
function crearProductoCarritoHTML(item) {
    return `
        <div class="producto-carrito" data-id="${item.id}">
            <img src="${item.imagen}" alt="${item.nombre}" class="producto-imagen">
            <div class="producto-info">
                <h3 class="producto-nombre">${item.nombre}</h3>
                <div class="producto-precio">S/ ${parseFloat(item.precio).toFixed(2)}</div>
            </div>
            <div class="producto-cantidad">
                <button class="cantidad-btn" onclick="actualizarCantidad('${item.id}', -1)">-</button>
                <input type="number" class="cantidad-input" value="${item.cantidad}" 
                       onchange="actualizarCantidadInput('${item.id}', this.value)">
                <button class="cantidad-btn" onclick="actualizarCantidad('${item.id}', 1)">+</button>
                <button class="btn btn-text" onclick="eliminarProducto('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Actualizar resumen de compra
function actualizarResumen() {
    document.getElementById('subtotal').textContent = `S/ ${carrito.subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `S/ ${carrito.total.toFixed(2)}`;
}

// Funciones de manipulación del carrito
async function actualizarCantidad(lineId, cambio) {
    const item = carrito.items.find(item => item.id === lineId);
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;
    if (nuevaCantidad > 0) {
        await actualizarCantidadEnShopify(lineId, nuevaCantidad);
    }
}

async function actualizarCantidadInput(lineId, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad > 0) {
        await actualizarCantidadEnShopify(lineId, cantidad);
    }
}

async function actualizarCantidadEnShopify(lineId, cantidad) {
    try {
        const mutation = `
            mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
                cartLinesUpdate(cartId: $cartId, lines: $lines) {
                    cart {
                        id
                        lines(first: 50) {
                            edges {
                                node {
                                    id
                                    quantity
                                    merchandise {
                                        ... on ProductVariant {
                                            id
                                            title
                                            price {
                                                amount
                                            }
                                            image {
                                                url
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        cost {
                            subtotalAmount {
                                amount
                            }
                            totalAmount {
                                amount
                            }
                        }
                    }
                }
            }
        `;

        const variables = {
            cartId: carrito.id,
            lines: [{
                id: lineId,
                quantity: cantidad
            }]
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
        if (data.data?.cartLinesUpdate?.cart) {
            carrito = {
                id: data.data.cartLinesUpdate.cart.id,
                items: data.data.cartLinesUpdate.cart.lines.edges.map(edge => ({
                    id: edge.node.id,
                    variantId: edge.node.merchandise.id,
                    nombre: edge.node.merchandise.title,
                    precio: edge.node.merchandise.price.amount,
                    imagen: edge.node.merchandise.image?.url || 'assets/images/productos/default.jpg',
                    cantidad: edge.node.quantity
                })),
                subtotal: parseFloat(data.data.cartLinesUpdate.cart.cost.subtotalAmount.amount),
                total: parseFloat(data.data.cartLinesUpdate.cart.cost.totalAmount.amount)
            };
            actualizarUI();
        }
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        alert('Error al actualizar la cantidad del producto');
    }
}

async function eliminarProducto(lineId) {
    try {
        const mutation = `
            mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
                cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                    cart {
                        id
                        lines(first: 50) {
                            edges {
                                node {
                                    id
                                    quantity
                                    merchandise {
                                        ... on ProductVariant {
                                            id
                                            title
                                            price {
                                                amount
                                            }
                                            image {
                                                url
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        cost {
                            subtotalAmount {
                                amount
                            }
                            totalAmount {
                                amount
                            }
                        }
                    }
                }
            }
        `;

        const variables = {
            cartId: carrito.id,
            lineIds: [lineId]
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
        if (data.data?.cartLinesRemove?.cart) {
            carrito = {
                id: data.data.cartLinesRemove.cart.id,
                items: data.data.cartLinesRemove.cart.lines.edges.map(edge => ({
                    id: edge.node.id,
                    variantId: edge.node.merchandise.id,
                    nombre: edge.node.merchandise.title,
                    precio: edge.node.merchandise.price.amount,
                    imagen: edge.node.merchandise.image?.url || 'assets/images/productos/default.jpg',
                    cantidad: edge.node.quantity
                })),
                subtotal: parseFloat(data.data.cartLinesRemove.cart.cost.subtotalAmount.amount),
                total: parseFloat(data.data.cartLinesRemove.cart.cost.totalAmount.amount)
            };
            actualizarUI();
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto del carrito');
    }
}

async function limpiarCarrito() {
    if (confirm('¿Estás seguro de que deseas limpiar el carrito?')) {
        try {
            const mutation = `
                mutation cartClear($cartId: ID!) {
                    cartClear(cartId: $cartId) {
                        cart {
                            id
                            lines(first: 1) {
                                edges {
                                    node {
                                        id
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
                body: JSON.stringify({
                    query: mutation,
                    variables: { cartId: carrito.id }
                })
            });

            const data = await response.json();
            if (data.data?.cartClear?.cart) {
                carrito = {
                    id: data.data.cartClear.cart.id,
                    items: [],
                    subtotal: 0,
                    total: 0
                };
                actualizarUI();
            }
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            alert('Error al limpiar el carrito');
        }
    }
}

// Funciones de pago
function procederPago() {
    if (carrito.items.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    // Redirigir al checkout de Shopify
    window.location.href = `https://${shopifyConfig.shop}/cart/${carrito.id}`;
}

// Inicializar carrito al cargar la página
document.addEventListener('DOMContentLoaded', cargarCarrito); 