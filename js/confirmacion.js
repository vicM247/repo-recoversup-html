// Generar número de pedido aleatorio
function generarNumeroPedido() {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `#${año}${mes}${dia}${random}`;
}

// Cargar datos del pedido
function cargarDatosPedido() {
    // Generar número de pedido
    document.getElementById('numeroPedido').textContent = generarNumeroPedido();

    // Cargar datos del pedido desde localStorage
    const pedidoGuardado = localStorage.getItem('ultimoPedido');
    if (pedidoGuardado) {
        const pedido = JSON.parse(pedidoGuardado);
        actualizarResumen(pedido);
        actualizarProductosResumen(pedido.items);
        actualizarInformacionEnvio(pedido.envio);
    } else {
        // Si no hay pedido guardado, redirigir a la página principal
        window.location.href = 'index.html';
    }
}

// Actualizar resumen de compra
function actualizarResumen(pedido) {
    document.getElementById('subtotal').textContent = `S/ ${pedido.subtotal.toFixed(2)}`;
    document.getElementById('descuento').textContent = `-S/ ${(pedido.subtotal * pedido.descuento).toFixed(2)}`;
    document.getElementById('envio').textContent = `S/ ${pedido.envio.toFixed(2)}`;
    document.getElementById('total').textContent = `S/ ${pedido.total.toFixed(2)}`;
}

// Actualizar lista de productos en el resumen
function actualizarProductosResumen(productos) {
    const container = document.getElementById('productosResumen');
    container.innerHTML = productos.map(producto => `
        <div class="producto-resumen">
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
            <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <span class="producto-cantidad">Cantidad: ${producto.cantidad}</span>
            </div>
            <div class="producto-precio">
                S/ ${(producto.precio * producto.cantidad).toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Actualizar información de envío
function actualizarInformacionEnvio(envio) {
    const container = document.getElementById('envioDetalles');
    container.innerHTML = `
        <p><strong>Nombre:</strong> ${envio.nombre}</p>
        <p><strong>Email:</strong> ${envio.email}</p>
        <p><strong>Teléfono:</strong> ${envio.telefono}</p>
        <p><strong>DNI:</strong> ${envio.dni}</p>
        <p><strong>Dirección:</strong> ${envio.direccion}</p>
        <p><strong>Ciudad:</strong> ${envio.ciudad}</p>
        <p><strong>Distrito:</strong> ${envio.distrito}</p>
        <p><strong>Código Postal:</strong> ${envio.codigoPostal}</p>
    `;
}

// Descargar factura
function descargarFactura() {
    // Aquí iría la lógica para generar y descargar la factura
    alert('La factura se está generando...');
    
    // Simular generación de factura
    setTimeout(() => {
        alert('Factura generada correctamente');
        // Aquí se podría implementar la descarga real del PDF
    }, 1500);
}

// Inicializar página
document.addEventListener('DOMContentLoaded', cargarDatosPedido); 