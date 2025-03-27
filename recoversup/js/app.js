// Swiper Initialization
const swiper = new Swiper('.hero-slider', {
    loop: true,
    autoplay: {
        delay: 5000,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    effect: 'fade',
    fadeEffect: {
        crossFade: true
    }
});

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

// Mobile Menu
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    navLinks.classList.toggle('active');
    menuBtn.classList.toggle('active');
    
    // Cerrar menú al hacer click fuera
    if(navLinks.classList.contains('active')) {
        document.addEventListener('click', function closeMenu(e) {
            if(!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
                navLinks.classList.remove('active');
                menuBtn.classList.remove('active');
                document.removeEventListener('click', closeMenu);
            }
        });
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

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    showPopup();
    renderProducts();
    updateCartUI();
    
    // Event listeners
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => toggleFAQ(question));
    });
});