// Funciones para la página de cuenta de usuario

// Cargar datos del usuario
function cargarDatosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {
        nombre: 'Usuario',
        email: 'usuario@ejemplo.com',
        telefono: '',
        direcciones: [],
        favoritos: [],
        pedidos: []
    };

    // Actualizar información del usuario
    document.querySelector('.usuario-info h3').textContent = usuario.nombre;
    document.querySelector('.usuario-info p').textContent = usuario.email;

    // Cargar sección activa
    const seccion = window.location.hash.slice(1) || 'perfil';
    mostrarSeccion(seccion);

    // Cargar datos de la sección
    switch(seccion) {
        case 'perfil':
            cargarPerfil(usuario);
            break;
        case 'pedidos':
            cargarPedidos(usuario.pedidos);
            break;
        case 'direcciones':
            cargarDirecciones(usuario.direcciones);
            break;
        case 'favoritos':
            cargarFavoritos(usuario.favoritos);
            break;
    }
}

// Mostrar sección activa
function mostrarSeccion(seccion) {
    // Actualizar menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('href') === `#${seccion}`) {
            item.classList.add('active');
        }
    });

    // Mostrar contenido
    document.querySelectorAll('.seccion').forEach(s => {
        s.style.display = 'none';
        if(s.id === seccion) {
            s.style.display = 'block';
        }
    });
}

// Cargar perfil
function cargarPerfil(usuario) {
    const form = document.getElementById('perfil-form');
    form.nombre.value = usuario.nombre;
    form.email.value = usuario.email;
    form.telefono.value = usuario.telefono;
}

// Guardar perfil
function guardarPerfil(e) {
    e.preventDefault();
    const form = e.target;
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
    
    usuario.nombre = form.nombre.value;
    usuario.email = form.email.value;
    usuario.telefono = form.telefono.value;

    localStorage.setItem('usuario', JSON.stringify(usuario));
    alert('Perfil actualizado correctamente');
}

// Cargar pedidos
function cargarPedidos(pedidos) {
    const contenedor = document.querySelector('.pedidos-lista');
    contenedor.innerHTML = '';

    if(pedidos.length === 0) {
        contenedor.innerHTML = '<p>No hay pedidos realizados</p>';
        return;
    }

    pedidos.forEach(pedido => {
        const elemento = document.createElement('div');
        elemento.className = 'pedido-item';
        elemento.innerHTML = `
            <div class="pedido-info">
                <span class="pedido-numero">Pedido #${pedido.numero}</span>
                <span class="pedido-fecha">${new Date(pedido.fecha).toLocaleDateString()}</span>
            </div>
            <span class="pedido-estado estado-${pedido.estado.toLowerCase()}">${pedido.estado}</span>
        `;
        contenedor.appendChild(elemento);
    });
}

// Cargar direcciones
function cargarDirecciones(direcciones) {
    const contenedor = document.querySelector('.direcciones-lista');
    contenedor.innerHTML = '';

    if(direcciones.length === 0) {
        contenedor.innerHTML = '<p>No hay direcciones guardadas</p>';
        return;
    }

    direcciones.forEach((direccion, index) => {
        const elemento = document.createElement('div');
        elemento.className = 'direccion-item';
        elemento.innerHTML = `
            <div class="direccion-titulo">${direccion.titulo}</div>
            <div class="direccion-detalles">
                ${direccion.direccion}<br>
                ${direccion.ciudad}, ${direccion.codigoPostal}
            </div>
            <div class="direccion-acciones">
                <button onclick="editarDireccion(${index})" class="btn-icon">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarDireccion(${index})" class="btn-icon">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(elemento);
    });
}

// Agregar dirección
function agregarDireccion(e) {
    e.preventDefault();
    const form = e.target;
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
    
    const direccion = {
        titulo: form.titulo.value,
        direccion: form.direccion.value,
        ciudad: form.ciudad.value,
        codigoPostal: form.codigoPostal.value
    };

    if(!usuario.direcciones) usuario.direcciones = [];
    usuario.direcciones.push(direccion);

    localStorage.setItem('usuario', JSON.stringify(usuario));
    cargarDirecciones(usuario.direcciones);
    form.reset();
}

// Editar dirección
function editarDireccion(index) {
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
    const direccion = usuario.direcciones[index];
    
    const form = document.getElementById('direccion-form');
    form.titulo.value = direccion.titulo;
    form.direccion.value = direccion.direccion;
    form.ciudad.value = direccion.ciudad;
    form.codigoPostal.value = direccion.codigoPostal;

    // Cambiar comportamiento del formulario
    form.onsubmit = (e) => {
        e.preventDefault();
        usuario.direcciones[index] = {
            titulo: form.titulo.value,
            direccion: form.direccion.value,
            ciudad: form.ciudad.value,
            codigoPostal: form.codigoPostal.value
        };

        localStorage.setItem('usuario', JSON.stringify(usuario));
        cargarDirecciones(usuario.direcciones);
        form.reset();
        form.onsubmit = agregarDireccion; // Restaurar comportamiento original
    };
}

// Eliminar dirección
function eliminarDireccion(index) {
    if(confirm('¿Estás seguro de eliminar esta dirección?')) {
        const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
        usuario.direcciones.splice(index, 1);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        cargarDirecciones(usuario.direcciones);
    }
}

// Cargar favoritos
function cargarFavoritos(favoritos) {
    const contenedor = document.querySelector('.favoritos-grid');
    contenedor.innerHTML = '';

    if(favoritos.length === 0) {
        contenedor.innerHTML = '<p>No hay productos favoritos</p>';
        return;
    }

    favoritos.forEach(producto => {
        const elemento = document.createElement('div');
        elemento.className = 'favorito-item';
        elemento.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="favorito-imagen">
            <div class="favorito-info">
                <h3 class="favorito-nombre">${producto.nombre}</h3>
                <span class="favorito-precio">S/ ${producto.precio.toFixed(2)}</span>
            </div>
        `;
        contenedor.appendChild(elemento);
    });
}

// Cambiar contraseña
function cambiarContrasena(e) {
    e.preventDefault();
    const form = e.target;
    
    if(form.nuevaContrasena.value !== form.confirmarContrasena.value) {
        alert('Las contraseñas no coinciden');
        return;
    }

    // Aquí iría la lógica para cambiar la contraseña en el backend
    alert('Contraseña actualizada correctamente');
    form.reset();
}

// Eliminar cuenta
function eliminarCuenta() {
    if(confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
    }
}

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();

    // Event listeners
    document.getElementById('perfil-form').addEventListener('submit', guardarPerfil);
    document.getElementById('direccion-form').addEventListener('submit', agregarDireccion);
    document.getElementById('contrasena-form').addEventListener('submit', cambiarContrasena);
    document.getElementById('eliminar-cuenta').addEventListener('click', eliminarCuenta);

    // Navegación por hash
    window.addEventListener('hashchange', () => {
        const seccion = window.location.hash.slice(1) || 'perfil';
        mostrarSeccion(seccion);
    });
}); 