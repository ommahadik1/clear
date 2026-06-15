/* logger.js */

// Universal scope handler: 'window' for DOM environments, 'self' for Service Workers
const globalScope = typeof window !== 'undefined' ? window : self;

/**
 * Standardized Prying Eyes Logging Utility
 * @param {string} component - The name of the script/module (e.g., 'Background', 'Offscreen')
 * @param {string} message - The diagnostic text
 * @param {any} [data=null] - Optional object/array to dump to the console
 * @param {string} [type='info'] - 'info', 'warn', or 'error'
 */
function peLog(component, message, data = null, type = 'info') {
    const prefix = `[PryingEyes: ${component}]`;
    // Premium Blue styling for our console prefix
    const style = 'font-weight: 700; color: #0070F3; background-color: rgba(0, 112, 243, 0.1); padding: 2px 6px; border-radius: 4px;';
    
    if (data !== null) {
        if (type === 'error') console.error(`%c${prefix}`, style, message, data);
        else if (type === 'warn') console.warn(`%c${prefix}`, style, message, data);
        else console.log(`%c${prefix}`, style, message, data);
    } else {
        if (type === 'error') console.error(`%c${prefix}`, style, message);
        else if (type === 'warn') console.warn(`%c${prefix}`, style, message);
        else console.log(`%c${prefix}`, style, message);
    }
}

// Global Error Interceptors
globalScope.addEventListener('error', (event) => {
    // Suppress unpreventable WebGazer fetch loops from crashing the extension dashboard
    if (event.message && event.message.includes('Failed to fetch')) {
        event.preventDefault();
        return;
    }
    peLog('Global', `Unhandled Error: ${event.message}`, event.error, 'error');
});

globalScope.addEventListener('unhandledrejection', (event) => {
    const reasonStr = event.reason ? event.reason.toString() : '';
    if (reasonStr.includes('Failed to fetch') || reasonStr.includes('NetworkError') || reasonStr.includes('Load failed')) {
        event.preventDefault(); // Prevents it from hitting Chrome's error dashboard
        return;
    }
    peLog('Global', `Unhandled Promise Rejection: ${event.reason}`, null, 'error');
});

// Channel Validation: Passive Health Check Responder
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'PE_HEALTH_CHECK') {
            const context = typeof window === 'undefined' ? 'Background Service Worker' : (document.title || 'Content/Offscreen Document');
            sendResponse({ status: 'OK', context: context, timestamp: Date.now() });
            return true; // Keep the response channel open
        }
    });
}
