// theme-init.js
(function() {
    const savedColor = localStorage.getItem('pe_theme_color');
    if (savedColor) {
        document.documentElement.style.setProperty('--accent-color', savedColor);
    } else {
        document.documentElement.style.setProperty('--accent-color', '#0070F3');
    }

    const isLightMode = localStorage.getItem('pe_light_mode') === 'true';
    const observer = new MutationObserver(function() {
        if (document.body) {
            if (isLightMode) {
                document.body.classList.add('light-mode');
            }
            observer.disconnect();
        }
    });
    observer.observe(document.documentElement, { childList: true });
})();
