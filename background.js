/* background.js */
importScripts('logger.js');

peLog('Background', 'Service Worker Initialized. Promise Queue & Health Checks active.');

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install' || details.reason === 'update') {
        chrome.tabs.create({ url: 'landing.html' });
    }

    // Defensive Storage Guard
    if (chrome.runtime && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ 
            privacyModeEnabled: false
        });
    } else {
        peLog('Background', 'Storage API totally unavailable during install hook.', null, 'error');
    }
});

let activeTabId = null;

// Initialize immediately so we don't drop coordinates before a tab switch happens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // FIX (Line 56 Crash): Defensive array verification against Chrome API null returns
    if (!tabs || !Array.isArray(tabs) || tabs.length === 0) {
        peLog('Background', 'Active tab query returned empty. Awaiting user focus.', null, 'warn');
        return;
    }
    activeTabId = tabs[0].id;
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    activeTabId = activeInfo.tabId;
});

// Update the active tab when the user switches to a different Chrome window
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
            // FIX: Defensive array verification on window change
            if (!tabs || !Array.isArray(tabs) || tabs.length === 0) return;
            activeTabId = tabs[0].id;
        });
    }
});

// Keyboard Shortcut: Global Kill Switch
chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-privacy-mask') {
        chrome.storage.local.get(['privacyModeEnabled'], (result) => {
            const newState = !result.privacyModeEnabled;
            // Saving this state automatically broadcasts to all active content.js tabs 
            // and the popup via the chrome.storage.onChanged event.
            chrome.storage.local.set({ privacyModeEnabled: newState }, () => {
                console.log(`Global Kill Switch triggered: Privacy Mask is now ${newState ? 'ON' : 'OFF'}`);
            });
        });
    }
});
