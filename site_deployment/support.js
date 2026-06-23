// EmailJS Initialization
(function() {
    emailjs.init({
        publicKey: "W6cF2GuKRn_X1ZGeN",
    });
})();

const form = document.getElementById('support-form');
const ringProgress = document.getElementById('ringProgress');
const circleBtnInner = document.getElementById('circleBtnInner');
const holdLabel = document.getElementById('holdLabel');
const iconSend = document.getElementById('iconSend');
const iconCheck = document.getElementById('iconCheck');
const holdWrapper = document.getElementById('holdToSendBtn');

let animationFrameId = null;
let startTime = 0;
const holdDuration = 900; // ms
const circumference = 289.02;
let isComplete = false;

function startHold(e) {
    if (isComplete) return;
    
    // Check form validity before animating
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Prevent default touch behavior to stop screen from scrolling when holding
    if (e.type === 'touchstart' && e.cancelable) {
        e.preventDefault();
    }

    // Reset visual state
    ringProgress.classList.remove('snapping');
    startTime = performance.now();
    cancelAnimationFrame(animationFrameId);
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(fillRing);
}

function fillRing(timestamp) {
    if (isComplete) return;
    
    let progress = (timestamp - startTime) / holdDuration;
    if (progress > 1) progress = 1;
    
    // Map progress to dashoffset
    let offset = circumference * (1 - progress);
    ringProgress.style.strokeDashoffset = offset;
    
    if (progress >= 1) {
        completeSend();
    } else {
        // Continue animating
        animationFrameId = requestAnimationFrame(fillRing);
    }
}

function endHold() {
    if (isComplete) return;
    
    // Abort animation
    cancelAnimationFrame(animationFrameId);
    
    // Snap back to 0
    ringProgress.classList.add('snapping');
    ringProgress.style.strokeDashoffset = circumference;
}

function completeSend() {
    isComplete = true;
    ringProgress.style.strokeDashoffset = 0;
    
    // Update UI state to Success
    holdWrapper.classList.add('success-state');
    circleBtnInner.classList.add('success-state');
    iconSend.style.display = 'none';
    iconCheck.style.display = 'block';
    holdLabel.textContent = 'SENT';
    
    // Fire EmailJS
    emailjs.sendForm('service_8n21mup', 'template_6once8q', '#support-form')
        .then(function() {
            // Keep success state for 2 seconds, then reset
            setTimeout(() => {
                form.reset();
                resetButton();
            }, 2000);
        }, function(error) {
            alert('Failed to send message: ' + JSON.stringify(error));
            resetButton();
        });
}

function resetButton() {
    isComplete = false;
    
    // Remove success styles
    holdWrapper.classList.remove('success-state');
    circleBtnInner.classList.remove('success-state');
    iconSend.style.display = 'block';
    iconCheck.style.display = 'none';
    holdLabel.textContent = 'HOLD TO SEND';
    
    // Snap progress back
    ringProgress.classList.add('snapping');
    ringProgress.style.strokeDashoffset = circumference;
}

// Event Listeners for the Hold Interaction
circleBtnInner.addEventListener('mousedown', startHold);
circleBtnInner.addEventListener('touchstart', startHold, {passive: false});

document.addEventListener('mouseup', endHold);
document.addEventListener('touchend', endHold);
circleBtnInner.addEventListener('mouseleave', endHold);

// Handle native form submission via 'Enter' key for Accessibility
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!isComplete && form.checkValidity()) {
        completeSend();
    }
});

// Spotlight Border Glow Effect Tracker
document.querySelectorAll('.glow-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});
