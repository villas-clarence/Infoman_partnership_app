document.addEventListener('DOMContentLoaded', () => {
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
        document.body.style.overflow = 'hidden';
    }

    function closeModal(event) {
        if (event && event.target !== event.currentTarget) return;
        document.getElementById('aboutModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('active');
            const hamburger = this.querySelector('.hamburger');
            hamburger.classList.toggle('active');
        });
    }

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

    document.querySelectorAll('.plan-item .toggle-text').forEach(toggle => {
        toggle.addEventListener('click', function() {
            togglePlan(this.parentElement);
        });
    });

    // Add event listener for About dropdown toggle
    document.querySelectorAll('.dropdown-toggle').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const dropdownMenu = this.nextElementSibling;
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
            this.setAttribute('aria-expanded', !isVisible);
        });
    });

    const cart = [];
    const cartItemsEl = document.getElementById('headerCartItems');
    const cartTotalEl = document.getElementById('headerCartTotal');
    const cartCountEl = document.getElementById('headerCartCount');
    const cartDropdown = document.getElementById('headerCartDropdown');
    const cartButton = document.getElementById('headerCartButton');
    const removeSelectedBtn = document.getElementById('headerRemoveSelectedBtn');

    function updateCartUI() {
        if (!cartItemsEl || !cartTotalEl || !cartCountEl) return;
        cartItemsEl.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <label>
                    <input type="checkbox" class="cart-item-checkbox" data-index="${index}" checked />
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">₱${item.price}</span>
                </label>
            `;
            cartItemsEl.appendChild(li);
        });
        cartTotalEl.textContent = total.toFixed(2);
        cartCountEl.textContent = cart.length;

        document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                let newTotal = 0;
                document.querySelectorAll('.cart-item-checkbox').forEach(cb => {
                    if (cb.checked) {
                        const idx = parseInt(cb.getAttribute('data-index'));
                        if (!isNaN(idx)) {
                            newTotal += cart[idx].price;
                        }
                    }
                });
                cartTotalEl.textContent = newTotal.toFixed(2);
            });
        });
    }

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            if (name && !isNaN(price)) {
                cart.push({ name, price });
                updateCartUI();
                alert(`${name} added to cart.`);
            }
        });
    });

    if (cartButton && cartDropdown) {
        cartButton.addEventListener('click', () => {
            if (cartDropdown.style.display === 'block') {
                cartDropdown.style.display = 'none';
            } else {
                cartDropdown.style.display = 'block';
            }
        });
    }

    if (removeSelectedBtn) {
        removeSelectedBtn.addEventListener('click', () => {
            const toRemove = [];
            document.querySelectorAll('.cart-item-checkbox').forEach(cb => {
                if (!cb.checked) {
                    const idx = parseInt(cb.getAttribute('data-index'));
                    if (!isNaN(idx)) {
                        toRemove.push(idx);
                    }
                }
            });
            toRemove.sort((a, b) => b - a);
            toRemove.forEach(idx => {
                cart.splice(idx, 1);
            });
            updateCartUI();
        });
    }
});
