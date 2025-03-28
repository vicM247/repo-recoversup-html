// Variables globales para el slider
let slideIndex = 0;
let slideInterval;

// Función para inicializar el slider
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    // Mostrar el primer slide
    showSlide(0);

    // Iniciar el intervalo
    startSlideInterval();

    // Event listeners para los botones
    document.querySelector('.slider-btn.prev').addEventListener('click', () => {
        cambiarSlide(-1);
    });
    
    document.querySelector('.slider-btn.next').addEventListener('click', () => {
        cambiarSlide(1);
    });

    // Event listeners para los dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            irASlide(index);
        });
    });

    // Pausar el intervalo cuando el mouse está sobre el slider
    const slider = document.querySelector('.hero-slider');
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    slider.addEventListener('mouseleave', () => {
        startSlideInterval();
    });
}

// Función para iniciar el intervalo del slider
function startSlideInterval() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    slideInterval = setInterval(() => {
        cambiarSlide(1);
    }, 5000);
}

// Función para cambiar de slide
function cambiarSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;

    slides[slideIndex].classList.remove('active');
    dots[slideIndex].classList.remove('active');

    slideIndex = slideIndex + n;

    if (slideIndex >= slides.length) {
        slideIndex = 0;
    }
    if (slideIndex < 0) {
        slideIndex = slides.length - 1;
    }

    slides[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');

    // Reiniciar el intervalo
    startSlideInterval();
}

// Función para mostrar un slide específico
function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;

    // Ocultar todos los slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Mostrar el slide seleccionado
    slides[n].classList.add('active');
    dots[n].classList.add('active');
    
    // Actualizar el índice global
    slideIndex = n;
}

// Función para ir a un slide específico (para los dots)
function irASlide(n) {
    showSlide(n);
    startSlideInterval();
}

// Popup Logic
function showPopup() {
    if(!localStorage.getItem('hidePopup')) {
        setTimeout(() => {
            document.getElementById('newsletterPopup').classList.add('popup-visible');
        }, 3000);
    }
}

function closePopup() {
    document.getElementById('newsletterPopup').classList.remove('popup-visible');
    if(document.getElementById('dontShowAgain').checked) {
        localStorage.setItem('hidePopup', 'true');
    }
}

// Función para el menú móvil
function toggleMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (menuBtn && mobileNav) {
        menuBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');
    }
}

// Cart Logic
let cart = [];
const products = [
    {
        id: 1,
        name: "Proteína Whey Premium",
        price: 149.90,
        image: "whey-protein.jpg",
        category: "proteínas",
        badge: "Más vendido"
    },
    // ... otros productos
];

function renderProducts() {
    const productsGrid = document.getElementById('products');
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <img src="images/${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">S/. ${product.price.toFixed(2)}</p>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    Agregar al Carrito
                </button>
            </div>
        </div>
    `).join('');
}

// Funciones del Carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    cartCount.textContent = cart.length;
}

// FAQ
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    faqItem.classList.toggle('faq-active');
}

// Función para el popup de promoción
function cerrarSuperPromo() {
    const popup = document.getElementById('superPromoPopup');
    const noMostrar = document.getElementById('noMostrarPromo').checked;
    
    if (popup) {
        popup.style.display = 'none';
        
        if (noMostrar) {
            localStorage.setItem('noMostrarPromo', 'true');
        }
    }
}

// Función para verificar si se debe mostrar el popup
function verificarPopup() {
    const noMostrar = localStorage.getItem('noMostrarPromo');
    const popup = document.getElementById('superPromoPopup');
    
    if (popup && noMostrar !== 'true') {
        setTimeout(() => {
            popup.style.display = 'flex';
        }, 100);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Event listeners para el menú móvil
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (menuBtn && mobileNav) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }

    // Inicializar otras funciones
    initSlider();
    verificarPopup();
    renderProducts();
    updateCartUI();
    
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => toggleFAQ(question));
    });
});