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

// Form submission handling
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formMessage = document.getElementById('form-message');
    formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
    formMessage.style.color = '#2d7a2d';
    this.reset();
});