document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');

    if (navToggle && navMenu && hamburger) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }


    // Enhanced Image Gallery Interactions
    const imageItems = document.querySelectorAll('.image-item');
    imageItems.forEach(item => {
        const img = item.querySelector('img');
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        if (img) {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
                this.style.transition = 'opacity 0.3s ease';
            });
            img.addEventListener('error', function() {
                console.warn(`Failed to load image: ${this.src} (Alt: ${this.alt})`);
                this.alt = 'Image not available';
                this.style.backgroundColor = '#f0f0f0';
                // Uncomment and update with a valid path if a placeholder image exists
                // this.src = '../assets/placeholder.jpg';
            });
        }
    });

    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        lastScrollTop = scrollTop;
        if (scrollTop > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // Dynamic text animation for the main heading
    const mainHeading = document.querySelector('#about h2');
    if (mainHeading) {
        // Check if spans already exist to avoid reprocessing
        if (!mainHeading.querySelector('span')) {
            const text = mainHeading.textContent.trim();
            mainHeading.textContent = ''; // Clear text but preserve pseudo-elements
            const words = text.split(' '); // Split by space to handle "About ANIYA"
            words.forEach((word, wordIndex) => {
                const wordSpan = document.createElement('span');
                wordSpan.style.display = 'inline-block';
                for (let i = 0; i < word.length; i++) {
                    const charSpan = document.createElement('span');
                    charSpan.textContent = word[i];
                    charSpan.style.opacity = '0';
                    charSpan.style.transform = 'translateY(20px)';
                    charSpan.style.display = 'inline-block';
                    charSpan.style.transition = `opacity 0.1s ease ${(wordIndex * 0.2 + i * 0.05)}s, transform 0.1s ease ${(wordIndex * 0.2 + i * 0.05)}s`;
                    wordSpan.appendChild(charSpan);
                }
                mainHeading.appendChild(wordSpan);
                // Add space between words
                if (wordIndex < words.length - 1) {
                    mainHeading.appendChild(document.createTextNode(' '));
                }
            });
        }
        const headingObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const spans = mainHeading.querySelectorAll('span span');
                spans.forEach(span => {
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                });
            }
        }, { threshold: 0.1 });
        headingObserver.observe(mainHeading);
    }

    // Accessibility improvements
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            navToggle.focus();
        }
    });

    const focusableElements = navMenu ? navMenu.querySelectorAll('a:not([tabindex="-1"]), button:not([tabindex="-1"])') : [];
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    if (navMenu) {
        navMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        });
    }

    console.log('Enhanced About Page initialized successfully');
    document.body.classList.add('loaded');
});