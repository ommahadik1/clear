(function() {
    const savedColor = localStorage.getItem('pe_theme_color');
    if (savedColor) {
        document.documentElement.style.setProperty('--accent-color', savedColor);
    } else {
        document.documentElement.style.setProperty('--accent-color', '#0070F3');
    }

    const isLightMode = localStorage.getItem('pe_light_mode') === 'true';
    if (isLightMode) {
        document.documentElement.classList.add('light-mode');
    }
})();
