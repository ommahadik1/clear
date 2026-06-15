/* popup.js */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup UI Initialized. Binding state handlers.');

    const privacyToggle = document.getElementById('privacy-toggle');

    // Load toggle state from storage
    chrome.storage.local.get(['privacyModeEnabled'], (result) => {
        privacyToggle.checked = !!result.privacyModeEnabled;
    });

    // Handle toggle switch
    privacyToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ privacyModeEnabled: isEnabled }, () => {
            console.log('Privacy mode set to:', isEnabled);
        });
    });

    // --- Dynamic Flashlight Sizing ---
    const radiusSlider = document.getElementById('radius-slider');
    const radiusValueDisplay = document.getElementById('radius-value');

    // Load saved radius from storage (default: 150)
    chrome.storage.local.get(['flashlightRadius'], (result) => {
        const savedRadius = result.flashlightRadius || 150;
        radiusSlider.value = savedRadius;
        radiusValueDisplay.textContent = `${savedRadius}px`;
    });

    // Listen for real-time ultra-smooth dragging
    radiusSlider.addEventListener('input', (e) => {
        const newRadius = parseInt(e.target.value, 10);
        radiusValueDisplay.textContent = `${newRadius}px`;
        
        // Save to storage natively
        chrome.storage.local.set({ flashlightRadius: newRadius });
        
        // Direct explicit broadcast to active tab for zero-lag rendering
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'UPDATE_RADIUS',
                    radius: newRadius
                }).catch(() => { /* Ignore dead receivers */ });
            }
        });
    });

    // --- Landing Page Button ---
    const landingBtn = document.getElementById('open-landing-btn');
    if (landingBtn) {
        landingBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'landing.html' });
        });
    }

    // --- Smart Blur Inspector Button ---
    const blurBtn = document.getElementById('btnTargetBlur');
    if (blurBtn) {
        blurBtn.addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'PE_TOGGLE_INSPECTOR'
                    }).catch(() => { /* Ignore dead receivers */ });
                }
            });
            blurBtn.textContent = 'Active...';
            setTimeout(() => { blurBtn.textContent = 'Select Element'; }, 2000);
        });
    }
});
