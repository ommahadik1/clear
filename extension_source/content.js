/* content.js */
(function() {
    const isTopFrame = (window === window.top);

    let isEnabled = false;
    let isInspectorMode = false;
    
    // --- 0. Smart Blur CSS Injection ---
    if (isTopFrame) {
        const style = document.createElement('style');
        style.textContent = `
            .pe-inspector-highlight { 
                outline: 3px solid #0070F3 !important; 
                background-color: rgba(0, 112, 243, 0.1) !important; 
                cursor: crosshair !important; 
            }
            .pe-smart-blur { 
                filter: blur(12px) !important; 
                transition: filter 0.2s ease-in-out !important; 
            }
            .pe-smart-blur:hover { 
                filter: blur(0px) !important; 
            }
        `;
        // Use a mutation observer or try appending directly to ensure head exists
        if (document.head) {
            document.head.appendChild(style);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
        }
    }

    // Top-frame specific variables
    let overlay = null;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let animationFrameId = null;

    // 1. Setup DOM Elements (strictly Top Frame only)
    if (isTopFrame) {
        overlay = document.getElementById('clear-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'clear-overlay';
            document.body.appendChild(overlay);
        }
    }

    // 2. Hardware Accelerated Render Loop
    function render() {
        if (!isTopFrame) return;
        if (!isEnabled) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            return;
        }

        // Smooth interpolation (lerp)
        currentX += (targetX - currentX) * 0.4;
        currentY += (targetY - currentY) * 0.4;

        // Hardware-accelerated mask-position update (10000px mask size -> 5000px center offset)
        const maskX = currentX - 5000;
        const maskY = currentY - 5000;
        overlay.style.setProperty('mask-position', `${maskX}px ${maskY}px`, 'important');
        overlay.style.setProperty('-webkit-mask-position', `${maskX}px ${maskY}px`, 'important');

        animationFrameId = requestAnimationFrame(render);
    }

    function updateCoordinates(x, y) {
        if (!isTopFrame) return;
        targetX = x;
        targetY = y;
    }

    let currentRadius = 150;

    function applyRadius() {
        if (!isTopFrame || !overlay) return;
        // Hardware Accelerated Soft-Edge Gradient
        // We keep it perfectly centered because the render loop moves the mask-position
        const gradient = `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${currentRadius}px, rgba(0,0,0,1) ${currentRadius + 50}px)`;
        overlay.style.setProperty('mask-image', gradient, 'important');
        overlay.style.setProperty('-webkit-mask-image', gradient, 'important');
    }

    // 3. Strict Mouse Event Handlers
    function handleMouseMove(e) {
        if (isEnabled) {
            if (isTopFrame) {
                updateCoordinates(e.clientX, e.clientY);
            } else {
                // Inside an iframe: relay coordinates up to parent
                window.parent.postMessage({
                    type: 'CLEAR_IFRAME_MOUSEMOVE',
                    x: e.clientX,
                    y: e.clientY
                }, '*');
            }
        }
    }

    // Recursively catch iframe messages and calculate absolute offset bounding boxes
    window.addEventListener('message', (e) => {
        if (isEnabled && e.data && e.data.type === 'CLEAR_IFRAME_MOUSEMOVE') {
            const iframes = document.querySelectorAll('iframe');
            for (let iframe of iframes) {
                if (iframe.contentWindow === e.source) {
                    const rect = iframe.getBoundingClientRect();
                    const absoluteX = e.data.x + rect.left;
                    const absoluteY = e.data.y + rect.top;

                    if (isTopFrame) {
                        updateCoordinates(absoluteX, absoluteY);
                    } else {
                        // Forward recursively to next parent if deeply nested
                        window.parent.postMessage({
                            type: 'CLEAR_IFRAME_MOUSEMOVE',
                            x: absoluteX,
                            y: absoluteY
                        }, '*');
                    }
                    break;
                }
            }
        }
    });

    // Global message dispatcher for top-level events
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'UPDATE_RADIUS' && isTopFrame) {
            currentRadius = message.radius;
            applyRadius();
        } else if (message.action === 'PE_TOGGLE_INSPECTOR' && isTopFrame) {
            isInspectorMode = !isInspectorMode;
            if (isInspectorMode) {
                console.log("Clear: Smart Element Blur Inspector ON.");
            } else {
                console.log("Clear: Smart Element Blur Inspector OFF.");
            }
        }
    });

    // 4. Toggle State Management
    function toggleMasking(enabled) {
        isEnabled = enabled;
        if (isTopFrame) {
            if (enabled) {
                overlay.classList.add('active');
                if (!animationFrameId) render();
            } else {
                overlay.classList.remove('active');
            }
        }
    }

    // 5. Viewport Boundary Clamping
    window.addEventListener('resize', () => {
        if (isTopFrame) {
            targetX = Math.min(Math.max(targetX, 0), window.innerWidth);
            targetY = Math.min(Math.max(targetY, 0), window.innerHeight);
        }
    });

    // 5. Init Configuration
    window.addEventListener('mousemove', handleMouseMove);

    // --- DOM Inspector Events ---
    window.addEventListener('mouseover', (e) => {
        if (isInspectorMode && isTopFrame) {
            e.target.classList.add('pe-inspector-highlight');
        }
    }, true);

    window.addEventListener('mouseout', (e) => {
        if (isInspectorMode && isTopFrame) {
            e.target.classList.remove('pe-inspector-highlight');
        }
    }, true);

    window.addEventListener('click', (e) => {
        if (isInspectorMode && isTopFrame) {
            e.preventDefault();
            e.stopPropagation();
            
            e.target.classList.remove('pe-inspector-highlight');
            e.target.classList.add('pe-smart-blur');
            
            isInspectorMode = false;
            console.log("Clear: Element blurred. Inspector OFF.");
        }
    }, true);

    chrome.storage.local.get(['privacyModeEnabled', 'flashlightRadius'], (result) => {
        if (result.flashlightRadius) {
            currentRadius = result.flashlightRadius;
            applyRadius();
        }
        
        toggleMasking(!!result.privacyModeEnabled);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.privacyModeEnabled !== undefined) {
                toggleMasking(changes.privacyModeEnabled.newValue);
            }
            if (changes.flashlightRadius !== undefined) {
                currentRadius = changes.flashlightRadius.newValue;
                applyRadius();
            }
        }
    });
})();
