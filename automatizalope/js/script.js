// Función principal que se ejecuta cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Configuración de textos dinámicos
    const dynamicTexts = [
        "Atención Automatizada",
        "Ventas personalizada", 
        "Publicidad efectiva",
        "Análisis de Datos",
        "Generación de Contenido",
        "Optimización de Procesos",
        "Monitoreo Inteligente", 
        "Alertas al instante",
        "Automatización de Tareas"
    ];

    const dynamicTextElement = document.getElementById("dynamic-text");
    let currentIndex = 0;

    // Función para rotar textos
    const changeDynamicText = () => {
        if (dynamicTextElement) {
            dynamicTextElement.textContent = dynamicTexts[currentIndex];
            currentIndex = (currentIndex + 1) % dynamicTexts.length;
        }
    };

    // Inicialización de textos dinámicos
    changeDynamicText();
    setInterval(changeDynamicText, 3000);

    // Configuración del menú móvil
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Configuración de AOS
    AOS.init({
        duration: 800,
        once: false,
        offset: 120,
        disable: () => window.innerWidth < 768 || navigator.userAgent.match(/Android/i)
    });
});

// Manejo de FAQ
const initializeFAQ = () => {
    // Manejo de contenedores FAQ
    const faqQuestions = document.querySelectorAll(".faq-container");
    faqQuestions.forEach(question => {
        question.addEventListener("click", () => {
            const faqCard = question.closest(".faq-card");
            if (faqCard) {
                faqCard.classList.toggle("active");
                const answer = faqCard.querySelector(".faq-answer");
                if (answer) {
                    answer.style.maxHeight = faqCard.classList.contains("active") 
                        ? answer.scrollHeight + "px" 
                        : null;
                }
            }
        });
    });

    // Manejo de preguntas individuales
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
            const answer = question.nextElementSibling;
            answer.style.maxHeight = answer.style.maxHeight 
                ? null 
                : answer.scrollHeight + "px";
        });
    });
};

// Inicializar FAQ
initializeFAQ();
