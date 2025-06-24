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

// Photo upload preview
document.getElementById('photo-upload')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const previewImg = document.querySelector('#photo-preview img');
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});