function togglePlan(element) {
    const ul = element.querySelector('ul');
    const toggleText = element.querySelector('.toggle-text strong');
    
    if (ul) {
        if (ul.classList.contains('show')) {
            ul.classList.remove('show');
            if (toggleText) toggleText.textContent = 'Click to view features ↓';
        } else {
            document.querySelectorAll('.plan-item ul.show').forEach(openUl => {
                openUl.classList.remove('show');
                const openToggleText = openUl.parentElement.querySelector('.toggle-text strong');
                if (openToggleText) openToggleText.textContent = 'Click to view features ↓';
            });
            
            ul.classList.add('show');
            if (toggleText) toggleText.textContent = 'Click to hide features ↑';
        }
    }
}

function openModal() {
    document.getElementById('aboutModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('aboutModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal when pressing Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Toggle mobile navigation
document.querySelector('.nav-toggle').addEventListener('click', function() {
    document.querySelector('.nav-menu').classList.toggle('active');
    const hamburger = this.querySelector('.hamburger');
    hamburger.classList.toggle('active');
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add toggle functionality to plan items
document.querySelectorAll('.plan-item .toggle-text').forEach(toggle => {
    toggle.addEventListener('click', function() {
        togglePlan(this.parentElement);
    });
});