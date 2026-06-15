/* landing.js */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Close Button Handler
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.close();
        });
    }

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        // Pause animation initially if it's below the fold
        if (el.getBoundingClientRect().top > window.innerHeight) {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        }
    });
});
