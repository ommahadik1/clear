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

    // Mobile Blocker
    if (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const style = document.createElement('style');
        style.textContent = `
            body { overflow: hidden !important; background: #0A0F1A !important; margin: 0; padding: 0; }
            html.light-mode body { background: #E2E8F0 !important; }
            body > *:not(#mobile-blocker) { display: none !important; }
            #mobile-blocker {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                text-align: center; padding: 30px; box-sizing: border-box;
                background-color: #0A0F1A; color: #F8FAFC; z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            html.light-mode #mobile-blocker { background-color: #E2E8F0; color: #0F172A; }
            #mobile-blocker h1 { font-size: 24px; margin-bottom: 16px; font-weight: 600; }
            #mobile-blocker p { font-size: 16px; color: #94A3B8; line-height: 1.5; margin: 0; max-width: 400px; }
            html.light-mode #mobile-blocker p { color: #475569; }
        `;
        document.head.appendChild(style);
        
        document.addEventListener('DOMContentLoaded', () => {
            const blocker = document.createElement('div');
            blocker.id = 'mobile-blocker';
            blocker.innerHTML = `
                <h1>Desktop Required</h1>
                <p>This extension cannot be used on a mobile device. Please visit us on a desktop browser to continue.</p>
            `;
            document.body.appendChild(blocker);
        });
    }
})();
