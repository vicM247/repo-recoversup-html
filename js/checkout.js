// Configuración de Shopify
const shopifyConfig = {
    shop: window.Shopify.shop,
    storefrontAccessToken: window.Shopify.storefrontAccessToken
};

// Cargar datos del carrito
async function cargarCarrito() {
    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
        window.location.href = 'carrito.html';
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
            actualizarResumen(data.data.cart);
            actualizarProductosResumen(data.data.cart.lines.edges);
        } else {
            window.location.href = 'carrito.html';
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        window.location.href = 'carrito.html';
    }
}

// Actualizar resumen de compra
function actualizarResumen(cart) {
    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
    const total = parseFloat(cart.cost.totalAmount.amount);

    // Actualizar resumen en el formulario
    document.getElementById('subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `S/ ${total.toFixed(2)}`;
    document.getElementById('totalPagar').textContent = total.toFixed(2);

    // Actualizar resumen en el panel lateral
    document.getElementById('resumenSubtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('resumenTotal').textContent = `S/ ${total.toFixed(2)}`;
}

// Actualizar lista de productos en el resumen
function actualizarProductosResumen(productos) {
    const container = document.getElementById('productosResumen');
    container.innerHTML = productos.map(edge => {
        const producto = edge.node.merchandise;
        return `
            <div class="producto-resumen">
                <img src="${producto.image?.url || 'assets/images/productos/default.jpg'}" 
                     alt="${producto.title}" class="producto-imagen">
                <div class="producto-info">
                    <h3 class="producto-nombre">${producto.title}</h3>
                    <span class="producto-cantidad">Cantidad: ${edge.node.quantity}</span>
                </div>
                <div class="producto-precio">
                    S/ ${(parseFloat(producto.price.amount) * edge.node.quantity).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Validar formulario
function validarFormulario() {
    const campos = [
        'nombre', 'email', 'telefono', 'dni', 'direccion',
        'ciudad', 'distrito', 'codigoPostal'
    ];

    let valido = true;
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        if (!input.value.trim()) {
            input.classList.add('error');
            valido = false;
        } else {
            input.classList.remove('error');
        }
    });

    return valido;
}

// Procesar pago
async function procesarPago() {
    if (!validarFormulario()) {
        alert('Por favor, completa todos los campos requeridos');
        return;
    }

    const cartId = localStorage.getItem('cartId');
    if (!cartId) {
        window.location.href = 'carrito.html';
        return;
    }

    try {
        // Obtener URL de checkout
        const query = `
            query getCart($cartId: ID!) {
                cart(id: $cartId) {
                    checkoutUrl
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
        if (data.data?.cart?.checkoutUrl) {
            // Guardar información de envío en localStorage
            const envio = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                dni: document.getElementById('dni').value,
                direccion: document.getElementById('direccion').value,
                ciudad: document.getElementById('ciudad').value,
                distrito: document.getElementById('distrito').value,
                codigoPostal: document.getElementById('codigoPostal').value
            };
            localStorage.setItem('ultimoEnvio', JSON.stringify(envio));

            // Redirigir al checkout de Shopify
            window.location.href = data.data.cart.checkoutUrl;
        }
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        alert('Error al procesar el pago. Por favor, intenta nuevamente.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();

    // Validar campos al perder el foco
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
    });
}); 