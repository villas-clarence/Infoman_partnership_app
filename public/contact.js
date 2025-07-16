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

// Form submission handling
document.getElementById('contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const form = this;
    const formData = new FormData(form);
    const formMessage = document.getElementById('form-message');

    formMessage.textContent = 'Sending message...';
    formMessage.style.color = '#555';

    fetch('php/contact.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            formMessage.textContent = data.success;
            formMessage.style.color = '#2d7a2d';
            form.reset();
        } else {
            formMessage.textContent = data.error || 'Submission failed.';
            formMessage.style.color = 'red';
        }
    })
    .catch(error => {
        formMessage.textContent = 'Something went wrong.';
        formMessage.style.color = 'red';
        console.error('Error:', error);
    });
});
