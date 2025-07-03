// Toggle visibility of updates chart in left navigation
function toggleUpdates() {
    const container = document.getElementById('updatesChartContainer');
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

// Placeholder for upgradeAccount function
function upgradeAccount() {
    alert('Upgrade to Grower or Legacy feature coming soon!');
}

// Placeholder for submitPartner function
function submitPartner() {
    const partnerNameInput = document.getElementById('partnerName');
    const name = partnerNameInput.value.trim();
    if (name) {
        alert(`Tree name "${name}" added!`);
        partnerNameInput.value = '';
    } else {
        alert('Please enter a tree name.');
    }
}

function logout() {
    fetch('php/logout.php', {
        method: 'POST',
        credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Redirect to login page or show login modal
            // Assuming login modal is on index.html or current page
            window.location.href = 'login.html'; // or adjust as needed
        } else {
            alert('Logout failed. Please try again.');
        }
    })
    .catch(() => {
        alert('Logout failed. Please try again.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  // Countdown Timer for Coffee Beans Readiness
  const targetDate = new Date("2025-10-01T00:00:00");
  const countdownEl = document.getElementById("countdown");

  // Logout confirmation popup
  const logoutLink = document.getElementById('logoutLink');
  const logoutConfirmPopup = document.getElementById('logoutConfirmPopup');
  const loginModal = document.getElementById('loginModal');

  // Removed logout popup event listeners to allow direct logout link navigation
  // if (logoutLink && logoutConfirmPopup && loginModal) {
  //   logoutLink.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     logoutConfirmPopup.style.display = 'flex';
  //     logoutConfirmPopup.style.alignItems = 'center';
  //     logoutConfirmPopup.style.justifyContent = 'center';
  //   });
  //
  //   const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  //   const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  //
  //   confirmLogoutBtn.addEventListener('click', () => {
  //     logoutConfirmPopup.style.display = 'none';
  //     loginModal.style.display = 'flex';
  //   });
  //
  //   cancelLogoutBtn.addEventListener('click', () => {
  //     logoutConfirmPopup.style.display = 'none';
  //   });
  // }

  function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
          countdownEl.textContent = "🎉 It's harvest time!";
          return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});
