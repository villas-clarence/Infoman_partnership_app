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

// Initialize animations on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.plan-item, .farm-section, .subscription-section');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate');
        }
    });
}

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);