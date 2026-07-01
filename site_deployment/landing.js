// Fetch live contributors from GitHub API
async function fetchContributors() {
    try {
        const response = await fetch('https://api.github.com/repos/ommahadik1/clear/contributors');
        if (!response.ok) {
            console.error('Failed to fetch contributors:', response.statusText);
            return;
        }
        
        const contributors = await response.json();
        const container = document.getElementById('dynamic-contributors');
        
        if (!container) return;

        contributors.forEach(contributor => {
            // Filter out the creator so they don't appear twice
            if (contributor.login.toLowerCase() === 'ommahadik1') {
                return;
            }

            // Create link wrapper
            const link = document.createElement('a');
            link.href = contributor.html_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'contributor-link';
            link.title = contributor.login;

            // Create avatar image
            const img = document.createElement('img');
            img.src = contributor.avatar_url;
            img.alt = contributor.login;
            img.className = 'contributor-avatar';
            img.loading = 'lazy';

            link.appendChild(img);
            container.appendChild(link);
        });
    } catch (error) {
        // Silently log any rate limit or network errors
        console.error('Error fetching contributors:', error);
    }
}

// Call asynchronously to not block rendering
fetchContributors();

// FAQ Accordion Logic
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('active');
        const answer = button.nextElementSibling;
        
        if (answer.style.maxHeight) {
            answer.style.maxHeight = null;
            answer.classList.remove('open');
        } else {
            answer.classList.add('open');
            // Adding a small delay to let the class apply padding before calculating scrollHeight
            requestAnimationFrame(() => {
                answer.style.maxHeight = answer.scrollHeight + "px";
            });
        }
    });
});

// Auth Gate Interception Logic
document.addEventListener('DOMContentLoaded', () => {
    const authLinks = document.querySelectorAll('.auth-required');
    const modal = document.getElementById('auth-gate-modal');
    const closeBtn = document.getElementById('close-modal-btn');

    if (!modal) return;

    authLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            modal.classList.remove('hidden');
            // Trigger a reflow to ensure the transition plays
            void modal.offsetWidth;
            modal.classList.add('active');
        });
    });

    const promptState = document.getElementById('auth-state-prompt');
    const loginState = document.getElementById('auth-state-login');
    const signupState = document.getElementById('auth-state-signup');
    
    const showLoginBtn = document.getElementById('show-login-btn');
    const showSignupBtn = document.getElementById('show-signup-btn');
    const backBtns = document.querySelectorAll('.back-to-prompt');

    const resetModal = () => {
        if (promptState && loginState && signupState) {
            promptState.classList.remove('hidden');
            loginState.classList.add('hidden');
            signupState.classList.add('hidden');
        }
    };

    if (showLoginBtn && promptState && loginState) {
        showLoginBtn.addEventListener('click', () => {
            promptState.classList.add('hidden');
            loginState.classList.remove('hidden');
        });
    }

    if (showSignupBtn && promptState && signupState) {
        showSignupBtn.addEventListener('click', () => {
            promptState.classList.add('hidden');
            signupState.classList.remove('hidden');
        });
    }

    backBtns.forEach(btn => {
        btn.addEventListener('click', resetModal);
    });

    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
            resetModal();
        }, 300); // Wait for transition to finish
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    const oauthBtns = document.querySelectorAll('.oauth-btn');
    oauthBtns.forEach(btn => {
        btn.addEventListener('click', function(event) {
            event.preventDefault();
            if (this.classList.contains('loading')) return;

            this.dataset.originalHtml = this.innerHTML;
            const provider = this.classList.contains('google-btn') ? 'Google' : 
                             this.classList.contains('github-btn') ? 'GitHub' : 'Provider';

            this.innerHTML = `<span class="spinner"></span> Connecting to ${provider}...`;
            this.classList.add('loading');
            
            console.log('OAuth initiated for:', provider);
        });
    });
});
