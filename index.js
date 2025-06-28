// Carousel functionality - OPTIMISÉ
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le carousel si présent
    const carousel = document.getElementById('carouselInner');
    if (carousel) {
        initCarousel();
    }
    
    // Gestion de la modale d'authentification
    document.getElementById('loginBtnIndex')?.addEventListener('click', showAuthModal);
    document.getElementById('registerBtnIndex')?.addEventListener('click', showAuthModal);
    document.getElementById('heroRegisterBtn')?.addEventListener('click', showAuthModal);
    
    // Initialiser les animations
    initAnimations();
});

function initCarousel() {
    const carousel = document.getElementById('carouselInner');
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentIndex = 0;
    const totalItems = items.length;
    
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
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
}

function showAuthModal() {
    loadAuthContent();
    document.getElementById('authModal').style.display = 'flex';
}

function initAnimations() {
    const animateElements = document.querySelectorAll('.animate');
    if (animateElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.visibility = 'visible';
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });
    
    animateElements.forEach(element => {
        element.style.visibility = 'hidden';
        observer.observe(element);
    });
}

// Back to top button
window.addEventListener('scroll', () => {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});