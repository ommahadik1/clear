/* popup.js */
document.addEventListener('DOMContentLoaded', () => {
    const privacyToggle = document.getElementById('privacy-toggle');
    const radiusSlider = document.getElementById('radius-slider');
    const radiusValueDisplay = document.getElementById('radius-value');
    const btnTargetBlur = document.getElementById('btnTargetBlur');
    const openLandingBtn = document.getElementById('open-landing-btn');

    // Initialize from storage
    chrome.storage.local.get(['privacyModeEnabled', 'flashlightRadius'], (result) => {
        if (privacyToggle) {
            privacyToggle.checked = !!result.privacyModeEnabled;
        }
        if (radiusSlider && radiusValueDisplay) {
            const savedRadius = result.flashlightRadius || 150;
            radiusSlider.value = savedRadius;
            radiusValueDisplay.textContent = `${savedRadius}px`;
        }
    });

    // Privacy Masking Toggle
    if (privacyToggle) {
        privacyToggle.addEventListener('change', (e) => {
            // content.js listens to chrome.storage.onChanged for privacyModeEnabled
            chrome.storage.local.set({ privacyModeEnabled: e.target.checked });
        });
    }

    // Flashlight Radius Slider
    if (radiusSlider) {
        // Real-time preview via messages
        radiusSlider.addEventListener('input', (e) => {
            const newRadius = parseInt(e.target.value, 10);
            if (radiusValueDisplay) {
                radiusValueDisplay.textContent = `${newRadius}px`;
            }
            
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0] && tabs[0].id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'UPDATE_RADIUS',
                        radius: newRadius
                    }).catch(() => {});
                }
            });
        });

        // Save to storage only when user releases the slider
        radiusSlider.addEventListener('change', (e) => {
            const newRadius = parseInt(e.target.value, 10);
            chrome.storage.local.set({ flashlightRadius: newRadius });
        });
    }

    // Smart Blur Inspector
    if (btnTargetBlur) {
        btnTargetBlur.addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0] && tabs[0].id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'PE_TOGGLE_INSPECTOR'
                    }).catch(() => {});
                }
            });
            btnTargetBlur.textContent = 'Active...';
            setTimeout(() => { btnTargetBlur.textContent = 'Select Element'; }, 2000);
        });
    }

    // Landing Page Link
    if (openLandingBtn) {
        openLandingBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'landing.html' });
        });
    }
});
