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
