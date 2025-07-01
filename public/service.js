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

// Cart functionality
const cart = [];
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const cartDropdown = document.getElementById('cartDropdown');
const cartButton = document.getElementById('cartButton');

function updateCartUI() {
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

    // Add event listeners for checkboxes to update total price
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

cartButton.addEventListener('click', () => {
    if (cartDropdown.style.display === 'none' || cartDropdown.style.display === '') {
        cartDropdown.style.display = 'block';
    } else {
        cartDropdown.style.display = 'none';
    }
});

// Remove selected items button functionality
const removeSelectedBtn = document.getElementById('removeSelectedBtn');
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
    // Remove items in reverse order to avoid index shift
    toRemove.sort((a, b) => b - a);
    toRemove.forEach(idx => {
        cart.splice(idx, 1);
    });
    updateCartUI();
});
