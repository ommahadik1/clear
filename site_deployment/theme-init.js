// theme-init.js
(function() {
    const savedColor = localStorage.getItem('pe_theme_color');
    if (savedColor) {
        document.documentElement.style.setProperty('--accent-color', savedColor);
    } else {
        document.documentElement.style.setProperty('--accent-color', '#0070F3');
    }
})();
