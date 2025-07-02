function openModal() {
    document.getElementById('aboutModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('aboutModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function togglePartnerFarms(type) {
    const currentBox = document.getElementById('currentPartnerFarms');
    const futureBox = document.getElementById('futurePartnerFarms');
    const currentToggle = document.querySelector('a[onclick*="current"]');
    const futureToggle = document.querySelector('a[onclick*="future"]');
    
    if (type === 'current') {
        if (currentBox.classList.contains('active')) {
            currentBox.classList.remove('active');
            currentToggle.classList.remove('active');
        } else {
            currentBox.classList.add('active');
            currentToggle.classList.add('active');
            futureBox.classList.remove('active');
            futureToggle.classList.remove('active');
        }
    } else if (type === 'future') {
        if (futureBox.classList.contains('active')) {
            futureBox.classList.remove('active');
            futureToggle.classList.remove('active');
        } else {
            futureBox.classList.add('active');
            futureToggle.classList.add('active');
            currentBox.classList.remove('active');
            currentToggle.classList.remove('active');
        }
    }
}

document.addEventListener('click', function(event) {
    const partnerItems = document.querySelectorAll('.partner-item');
    let clickedInside = false;
    
    partnerItems.forEach(item => {
        if (item.contains(event.target)) {
            clickedInside = true;
        }
    });
    
    if (!clickedInside) {
        const currentBox = document.getElementById('currentPartnerFarms');
        const futureBox = document.getElementById('futurePartnerFarms');
        const currentToggle = document.querySelector('a[onclick*="current"]');
        const futureToggle = document.querySelector('a[onclick*="future"]');
        
        if (currentBox && futureBox && currentToggle && futureToggle) {
            currentBox.classList.remove('active');
            futureBox.classList.remove('active');
            currentToggle.classList.remove('active');
            futureToggle.classList.remove('active');
        }
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const hamburger = this.querySelector('.hamburger');
            if (hamburger) {
                hamburger.classList.toggle('active');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
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
});