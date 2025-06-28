// Carousel functionality
const carousel = document.getElementById('carouselInner');
const items = document.querySelectorAll('.carousel-item');
const indicators = document.querySelectorAll('.indicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentIndex = 0;
const totalItems = items.length;

function updateCarousel() {
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        if (index === currentIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalItems;
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateCarousel();
});

// Auto slide
setInterval(() => {
    currentIndex = (currentIndex + 1) % totalItems;
    updateCarousel();
}, 5000);

// Click on indicators
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
    });
});

// Back to top button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.visibility = 'visible';
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1
    });
    
    animateElements.forEach(element => {
        element.style.visibility = 'hidden';
        observer.observe(element);
    });
});

// Gestion de la modale d'authentification
document.getElementById('loginBtnIndex')?.addEventListener('click', showAuthModal);
document.getElementById('registerBtnIndex')?.addEventListener('click', showAuthModal);
document.getElementById('heroRegisterBtn')?.addEventListener('click', showAuthModal);
document.getElementById('actionRegisterBtn')?.addEventListener('click', showAuthModal);

function showAuthModal() {
    // Charger le contenu d'authentification
    loadAuthContent();
    document.getElementById('authModal').style.display = 'flex';
}

// Fermer la modale en cliquant à l'extérieur
document.getElementById('authModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});