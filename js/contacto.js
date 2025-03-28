function enviarFormulario(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        asunto: document.getElementById('asunto').value,
        mensaje: document.getElementById('mensaje').value
    };
    
    // Validar datos
    if (!validarFormulario(formData)) {
        return false;
    }
    
    // Mostrar mensaje de envío
    mostrarMensaje('Enviando mensaje...', 'info');
    
    // Simular envío (reemplazar con tu lógica de backend)
    setTimeout(() => {
        mostrarMensaje('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', 'success');
        document.getElementById('contactForm').reset();
    }, 1500);
    
    return false;
}

function validarFormulario(data) {
    // Validar nombre
    if (data.nombre.length < 3) {
        mostrarMensaje('El nombre debe tener al menos 3 caracteres', 'error');
        return false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        mostrarMensaje('Por favor, ingresa un email válido', 'error');
        return false;
    }
    
    // Validar teléfono
    const telefonoRegex = /^\+?[\d\s-]{9,}$/;
    if (!telefonoRegex.test(data.telefono)) {
        mostrarMensaje('Por favor, ingresa un número de teléfono válido', 'error');
        return false;
    }
    
    // Validar asunto
    if (!data.asunto) {
        mostrarMensaje('Por favor, selecciona un asunto', 'error');
        return false;
    }
    
    // Validar mensaje
    if (data.mensaje.length < 10) {
        mostrarMensaje('El mensaje debe tener al menos 10 caracteres', 'error');
        return false;
    }
    
    return true;
}

function mostrarMensaje(mensaje, tipo) {
    // Crear elemento de mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.className = `mensaje mensaje-${tipo}`;
    mensajeElement.textContent = mensaje;
    
    // Agregar al contenedor
    const contenedor = document.querySelector('.contacto-form');
    contenedor.insertBefore(mensajeElement, contenedor.firstChild);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        mensajeElement.remove();
    }, 5000);
}

// Agregar estilos para los mensajes
const style = document.createElement('style');
style.textContent = `
    .mensaje {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        text-align: center;
    }
    
    .mensaje-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .mensaje-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .mensaje-info {
        background-color: #cce5ff;
        color: #004085;
        border: 1px solid #b8daff;
    }
`;
document.head.appendChild(style); 